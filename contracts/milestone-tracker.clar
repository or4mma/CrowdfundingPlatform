;; Constants
(define-constant err-not-found (err u101))

;; Data variables
(define-data-var next-milestone-id uint u1)

;; Maps
(define-map milestones uint {
  campaign-id: uint,
  description: (string-utf8 100),
  amount: uint,
  completed: bool
})

;; Public functions

;; Add a milestone to a campaign
(define-public (add-milestone (campaign-id uint) (description (string-utf8 100)) (amount uint))
  (let
    (
      (milestone-id (var-get next-milestone-id))
    )
    (map-set milestones milestone-id {
      campaign-id: campaign-id,
      description: description,
      amount: amount,
      completed: false
    })
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
    (map-set milestones milestone-id
      (merge milestone {completed: true}))
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-milestone-info (milestone-id uint))
  (map-get? milestones milestone-id))

(define-read-only (get-total-milestones)
  (- (var-get next-milestone-id) u1))

