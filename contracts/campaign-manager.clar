;; contracts/campaign-manager.clar

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-exists (err u103))
(define-constant err-invalid-amount (err u104))

;; Data variables
(define-data-var next-campaign-id uint u1)

;; Maps
(define-map campaigns uint {
  owner: principal,
  title: (string-ascii 100),
  description: (string-utf8 1000),
  goal: uint,
  raised: uint,
  start-block: uint,
  end-block: uint,
  is-active: bool
})

(define-map campaign-backers {campaign-id: uint, backer: principal} uint)

;; Private functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner))

(define-private (is-campaign-owner (campaign-id uint))
  (let ((campaign (unwrap! (map-get? campaigns campaign-id) false)))
    (is-eq tx-sender (get owner campaign))))

;; Public functions

;; Create a new campaign
(define-public (create-campaign (title (string-ascii 100)) (description (string-utf8 1000)) (goal uint) (duration uint))
  (let
    (
      (campaign-id (var-get next-campaign-id))
      (start-block block-height)
      (end-block (+ block-height duration))
    )
    (asserts! (> goal u0) err-invalid-amount)
    (map-set campaigns campaign-id {
      owner: tx-sender,
      title: title,
      description: description,
      goal: goal,
      raised: u0,
      start-block: start-block,
      end-block: end-block,
      is-active: true
    })
    (var-set next-campaign-id (+ campaign-id u1))
    (ok campaign-id)
  )
)

;; Back a campaign
(define-public (back-campaign (campaign-id uint) (amount uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns campaign-id) err-not-found))
      (current-amount (default-to u0 (map-get? campaign-backers {campaign-id: campaign-id, backer: tx-sender})))
    )
    (asserts! (get is-active campaign) err-unauthorized)
    (asserts! (<= block-height (get end-block campaign)) err-unauthorized)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set campaigns campaign-id
      (merge campaign {raised: (+ (get raised campaign) amount)}))
    (map-set campaign-backers {campaign-id: campaign-id, backer: tx-sender} (+ current-amount amount))
    (ok true)
  )
)

;; End a campaign
(define-public (end-campaign (campaign-id uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns campaign-id) err-not-found))
    )
    (asserts! (is-campaign-owner campaign-id) err-unauthorized)
    (asserts! (get is-active campaign) err-unauthorized)
    (asserts! (>= block-height (get end-block campaign)) err-unauthorized)
    (map-set campaigns campaign-id
      (merge campaign {is-active: false}))
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-campaign-info (campaign-id uint))
  (map-get? campaigns campaign-id))

(define-read-only (get-backer-amount (campaign-id uint) (backer principal))
  (default-to u0 (map-get? campaign-backers {campaign-id: campaign-id, backer: backer})))

(define-read-only (get-total-campaigns)
  (- (var-get next-campaign-id) u1))
