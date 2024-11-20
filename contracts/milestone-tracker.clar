;; contracts/milestone-tracker.clar

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-exists (err u103))
(define-constant err-invalid-milestone (err u104))

;; Data variables
(define-data-var next-milestone-id uint u1)

;; Maps
(define-map milestones uint {
  campaign-id: uint,
  description: (string-utf8 1000),
  amount: uint,
  completed: bool
})

(define-map campaign-milestones uint (list 10 uint))

;; Private functions
(define-private (is-campaign-manager)
  (is-eq contract-caller .campaign-manager))

;; Public functions

;; Add a milestone to a campaign
(define-public (add-milestone (campaign-id uint) (description (string-utf8 1000)) (amount uint))
  (let
    (
      (milestone-id (var-get next-milestone-id))
      (current-milestones (default-to (list) (map-get? campaign-milestones campaign-id)))
    )
    (asserts! (is-campaign-manager) err-unauthorized)
    (asserts! (< (len current-milestones) u10) err-invalid-milestone)
    (map-set milestones milestone-id {
      campaign-id: campaign-id,
      description: description,
      amount: amount,
      completed: false
    })
    (map-set campaign-milestones campaign-id (unwrap! (as-max-len? (append current-milestones milestone-id) u10) err-invalid-milestone))
    (var-set next-milestone-id (+ milestone-id u1))
    (ok milestone-id)
  )
)

;; Complete a milestone
(define-public (complete-milestone (milestone-id uint))
  (let
    (
      (milestone (unwrap! (map-get? milestones milestone-id) err-not-found))
    )
    (asserts! (is-campaign-manager) err-unauthorized)
    (asserts! (not (get completed milestone)) err-invalid-milestone)
    (map-set milestones milestone-id
      (merge milestone {completed: true}))
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-milestone-info (milestone-id uint))
  (map-get? milestones milestone-id))

(define-read-only (get-campaign-milestones (campaign-id uint))
  (map-get? campaign-milestones campaign-id))

(define-read-only (get-total-milestones)
  (- (var-get next-milestone-id) u1))
