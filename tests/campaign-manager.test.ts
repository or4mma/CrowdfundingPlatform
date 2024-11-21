import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

const contractSource = readFileSync('./contracts/campaign-manager.clar', 'utf8')

describe('Campaign Manager Contract', () => {
  it('should define contract-owner constant', () => {
    expect(contractSource).toContain('(define-constant contract-owner tx-sender)')
  })
  
  it('should define error constants', () => {
    expect(contractSource).toContain('(define-constant err-not-found (err u101))')
    expect(contractSource).toContain('(define-constant err-unauthorized (err u102))')
    expect(contractSource).toContain('(define-constant err-invalid-amount (err u104))')
  })
  
  it('should define next-campaign-id data variable', () => {
    expect(contractSource).toContain('(define-data-var next-campaign-id uint u1)')
  })
  
  it('should define campaigns map', () => {
    expect(contractSource).toContain('(define-map campaigns uint {')
    expect(contractSource).toContain('owner: principal,')
    expect(contractSource).toContain('title: (string-ascii 100),')
    expect(contractSource).toContain('goal: uint,')
    expect(contractSource).toContain('raised: uint,')
    expect(contractSource).toContain('end-block: uint,')
    expect(contractSource).toContain('is-active: bool')
  })
  
  it('should define campaign-backers map', () => {
    expect(contractSource).toContain('(define-map campaign-backers {campaign-id: uint, backer: principal} uint)')
  })
  
  it('should have a create-campaign function', () => {
    expect(contractSource).toContain('(define-public (create-campaign (title (string-ascii 100)) (goal uint) (duration uint))')
  })
  
  it('should check for valid goal amount in create-campaign function', () => {
    expect(contractSource).toContain('(asserts! (> goal u0) err-invalid-amount)')
  })
  
  it('should have a back-campaign function', () => {
    expect(contractSource).toContain('(define-public (back-campaign (campaign-id uint) (amount uint))')
  })
  
  it('should check for active campaign in back-campaign function', () => {
    expect(contractSource).toContain('(asserts! (get is-active campaign) err-unauthorized)')
  })
  
  it('should check for valid campaign end time in back-campaign function', () => {
    expect(contractSource).toContain('(asserts! (<= block-height (get end-block campaign)) err-unauthorized)')
  })
  
  it('should check for valid backing amount in back-campaign function', () => {
    expect(contractSource).toContain('(asserts! (> amount u0) err-invalid-amount)')
  })
  
  it('should have a get-campaign-info read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-campaign-info (campaign-id uint))')
  })
  
  it('should have a get-backer-amount read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-backer-amount (campaign-id uint) (backer principal))')
  })
  
  it('should have a get-total-campaigns read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-total-campaigns)')
  })
})

