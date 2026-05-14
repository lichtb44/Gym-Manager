# TODO - GymFit Manager

## Admin Approve Plan + Confirm Payment
- [ ] Inspect current admin approve flow and routes (already inspected).
- [ ] Update `MemberController::approvePlanChange` to: 
  - [ ] accept payment fields from request
  - [ ] on approve: activate member plan from `pending_plan`
  - [ ] create a `Payment` row marked as paid
  - [ ] on reject: clear `pending_plan` and mark rejected
- [x] Update `resources/js/pages/dashboard.tsx` admin pending approvals UI:
  - [x] replace simple Approve/Reject buttons with Approve dialog (payment method/date/amount)
  - [x] ensure submit payload matches backend.
- [x] Harden `PaymentController` only if needed (optional based on current behavior).
- [ ] Manual verification:
  - [ ] member selects plan => pending
  - [ ] admin approves with payment => active + payment created
  - [ ] admin rejects => rejected + no payment created


