import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

const contractSource = readFileSync('./contracts/reward-distributor.clar', 'utf8')

describe('Reward Distributor Contract', () => {
  it('should define error constants', () => {
    expect(contractSource).toContain('(define-constant err-unauthorized (err u102))')
    expect(contractSource).toContain('(define-constant err-already-claimed (err u103))')
    expect(contractSource).toContain('(define-constant err-invalid-reward (err u104))')
  })
  
  it('should define next-reward-id data variable', () => {
    expect(contractSource).toContain('(define-data-var next-reward-id uint u1)')
  })
  
  it('should define rewards map', () => {
    expect(contractSource).toContain('(define-map rewards uint {')
    expect(contractSource).toContain('campaign-id: uint,')
    expect(contractSource).toContain('title: (string-ascii 100),')
    expect(contractSource).toContain('amount: uint,')
    expect(contractSource).toContain('available: uint')
  })
  
  it('should define backer-rewards map', () => {
    expect(contractSource).toContain('(define-map backer-rewards {campaign-id: uint, backer: principal} (list 5 uint))')
  })
  
  it('should define claimed-rewards map', () => {
    expect(contractSource).toContain('(define-map claimed-rewards {reward-id: uint, backer: principal} bool)')
  })
  
  it('should have an add-reward function', () => {
    expect(contractSource).toContain('(define-public (add-reward (campaign-id uint) (title (string-ascii 100)) (amount uint) (available uint))')
  })
  
  it('should check for valid reward in add-reward function', () => {
    expect(contractSource).toContain('(asserts! (> amount u0) err-invalid-reward)')
    expect(contractSource).toContain('(asserts! (> available u0) err-invalid-reward)')
  })
  
  it('should have an assign-reward function', () => {
    expect(contractSource).toContain('(define-public (assign-reward (campaign-id uint) (backer principal) (reward-id uint))')
  })
  
  it('should check for available rewards in assign-reward function', () => {
    expect(contractSource).toContain('(asserts! (> (get available reward) u0) err-invalid-reward)')
  })
  
  it('should have a claim-reward function', () => {
    expect(contractSource).toContain('(define-public (claim-reward (reward-id uint))')
  })
  
  it('should check if reward is already claimed in claim-reward function', () => {
    expect(contractSource).toContain('(asserts! (not claimed) err-already-claimed)')
  })
  
  it('should have a get-reward-info read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-reward-info (reward-id uint))')
  })
  
  it('should have a get-backer-rewards read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-backer-rewards (campaign-id uint) (backer principal))')
  })
  
  it('should have an is-reward-claimed read-only function', () => {
    expect(contractSource).toContain('(define-read-only (is-reward-claimed (reward-id uint) (backer principal))')
  })
  
  it('should have a get-total-rewards read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-total-rewards)')
  })
})

