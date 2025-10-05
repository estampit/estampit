#!/usr/bin/env node

/**
 * Script de testing completo del flujo de rewards
 * Uso: node scripts/test-rewards-flow.js
 */

const fetch = globalThis.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)))

const BASE_URL = 'http://localhost:3001'

async function testRewardsFlow() {
  console.log('🧪 Testing Rewards Flow\n')

  try {
    // 1. Test enrollment
    console.log('1️⃣ Testing enrollment...')
    const enrollResponse = await fetch(`${BASE_URL}/api/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        email: `test${Date.now()}@example.com`,
        birthdate: '1990-01-01',
        storeCode: 'STORE123'
      })
    })

    if (!enrollResponse.ok) {
      const error = await enrollResponse.json()
      throw new Error(`Enrollment failed: ${error.error}`)
    }

    const enrollData = await enrollResponse.json()
    console.log('✅ Enrollment successful:', enrollData)

    // 2. Test pass download (check if endpoint exists)
    console.log('\n2️⃣ Testing pass download...')
    const passResponse = await fetch(`${BASE_URL}/api/pass/${enrollData.customerId}.pkpass?store=${enrollData.customerId.split('-')[0]}`)
    console.log('Pass download status:', passResponse.status)

    // 3. Test verification
    console.log('\n3️⃣ Testing verification...')
    const verifyResponse = await fetch(`${BASE_URL}/api/verify?token=invalid_token`)
    const verifyData = await verifyResponse.json()
    console.log('Verify response:', verifyData)

    console.log('\n🎉 Basic flow test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testRewardsFlow()