;; contracts/reward-distributor.clar

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-claimed (err u103))
(define-constant err-invalid-reward (err u104))

;; Data variables
(define-data-var next-reward-id uint u1)

;; Maps
(define-map rewards uint {
  campaign-id: uint,
  title: (string-ascii 100),
  description: (string-utf8 1000),
  amount: uint,
  available: uint
})

(define-map backer-rewards {campaign-id: uint, backer: principal} (list 5 uint))
(define-map claimed-rewards {reward-id: uint, backer: principal} bool)

;; Private functions
(define-private (is-campaign-manager)
  (is-eq contract-caller .campaign-manager))

;; Public functions

;; Add a reward to a campaign
(define-public (add-reward (campaign-id uint) (title (string-ascii 100)) (description (string-utf8 1000)) (amount uint) (available uint))
  (let
    (
      (reward-id (var-get next-reward-id))
    )
    (asserts! (is-campaign-manager) err-unauthorized)
    (asserts! (> amount u0) err-invalid-reward)
    (asserts! (> available u0) err-invalid-reward)
    (map-set rewards reward-id {
      campaign-id: campaign-id,
      title: title,
      description: description,
      amount: amount,
      available: available
    })
    (var-set next-reward-id (+ reward-id u1))
    (ok reward-id)
  )
)

;; Assign reward to a backer
(define-public (assign-reward (campaign-id uint) (backer principal) (reward-id uint))
  (let
    (
      (reward (unwrap! (map-get? rewards reward-id) err-not-found))
      (current-rewards (default-to (list) (map-get? backer-rewards {campaign-id: campaign-id, backer: backer})))
    )
    (asserts! (is-campaign-manager) err-unauthorized)
    (asserts! (> (get available reward) u0) err-invalid-reward)
    (asserts! (< (len current-rewards) u5) err-invalid-reward)
    (map-set rewards reward-id
      (merge reward {available: (- (get available reward) u1)}))
    (map-set backer-rewards {campaign-id: campaign-id, backer: backer}
      (unwrap! (as-max-len? (append current-rewards reward-id) u5) err-invalid-reward))
    (ok true)
  )
)

;; Claim a reward
(define-public (claim-reward (reward-id uint))
  (let
    (
      (reward (unwrap! (map-get? rewards reward-id) err-not-found))
      (claimed (default-to false (map-get? claimed-rewards {reward-id: reward-id, backer: tx-sender})))
    )
    (asserts! (not claimed) err-already-claimed)
    (asserts! (is-some (index-of (unwrap! (map-get? backer-rewards {campaign-id: (get campaign-id reward), backer: tx-sender}) err-unauthorized) reward-id)) err-unauthorized)
    (map-set claimed-rewards {reward-id: reward-id, backer: tx-sender} true)
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-reward-info (reward-id uint))
  (map-get? rewards reward-id))

(define-read-only (get-backer-rewards (campaign-id uint) (backer principal))
  (map-get? backer-rewards {campaign-id: campaign-id, backer: backer}))

(define-read-only (is-reward-claimed (reward-id uint) (backer principal))
  (default-to false (map-get? claimed-rewards {reward-id: reward-id, backer: backer})))

(define-read-only (get-total-rewards)
  (- (var-get next-reward-id) u1))
