import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculatePriceSma20,
  formatCurrencyIdr,
  formatDateWib,
  formatForeignFlow,
  formatPercentageChange,
  formatScore,
  getBandarmologyPresentation,
  getCompositeRiskPresentation,
  getQuickMarketSummary,
  getStatusLabel,
  getVolumeSpikePresentation,
} from '../lib/presentation/stock.ts'

test('formatForeignFlow formats positive, negative, zero, and null amounts', () => {
  assert.equal(formatForeignFlow(null), '—')
  assert.equal(formatForeignFlow(undefined), '—')
  assert.equal(formatForeignFlow(526248102500), 'Beli bersih Rp 526.248.102.500')
  assert.equal(formatForeignFlow(-526248102500), 'Jual bersih Rp 526.248.102.500')
  assert.equal(formatForeignFlow(0), 'Beli dan jual seimbang (Rp 0)')
})

test('formatCurrencyIdr handles null, undefined, and numbers', () => {
  assert.equal(formatCurrencyIdr(null), '—')
  assert.equal(formatCurrencyIdr(undefined), '—')
  assert.equal(formatCurrencyIdr(10150), 'Rp 10.150')
  assert.equal(formatCurrencyIdr(0), 'Rp 0')
})

test('formatDateWib formats dates or returns fallback', () => {
  assert.equal(formatDateWib(null), 'Tanggal belum tersedia')
  assert.equal(formatDateWib(undefined), 'Tanggal belum tersedia')
  assert.ok(formatDateWib('2026-03-15').includes('2026'))
})

test('formatPercentageChange handles positive, negative, and null fractions', () => {
  const up = formatPercentageChange(0.025)
  assert.equal(up.text, '+2.50%')
  assert.equal(up.trend, 'up')

  const down = formatPercentageChange(-0.0125)
  assert.equal(down.text, '-1.25%')
  assert.equal(down.trend, 'down')

  const neutral = formatPercentageChange(0)
  assert.equal(neutral.text, '0.00%')
  assert.equal(neutral.trend, 'neutral')

  const nullVal = formatPercentageChange(null)
  assert.equal(nullVal.text, '—')
  assert.equal(nullVal.trend, 'neutral')
})

test('formatScore handles null and finite numbers', () => {
  assert.equal(formatScore(null), 'Data belum cukup')
  assert.equal(formatScore(undefined), 'Data belum cukup')
  assert.equal(formatScore(75.4), '75/100')
  assert.equal(formatScore(100), '100/100')
})

test('getStatusLabel maps statuses to user-friendly labels and variants', () => {
  assert.deepEqual(getStatusLabel(null), { label: 'Data belum cukup', variant: 'insufficient' })
  assert.deepEqual(getStatusLabel('INSUFFICIENT_DATA'), {
    label: 'Data belum cukup',
    variant: 'insufficient',
  })
  assert.deepEqual(getStatusLabel('NORMAL'), {
    label: 'Belum ada peringatan khusus',
    variant: 'normal',
  })
  assert.deepEqual(getStatusLabel('BIG_ACCUMULATION'), {
    label: 'Pembelian besar melalui broker utama',
    variant: 'normal',
  })
  assert.deepEqual(getStatusLabel('CRITICAL'), {
    label: 'Ada peringatan penting',
    variant: 'critical',
  })
  assert.deepEqual(getStatusLabel('WARNING'), { label: 'Perlu diperiksa', variant: 'warning' })
})

test('calculatePriceSma20 returns all null if fewer than 20 sessions', () => {
  const rows = Array.from({ length: 15 }, (_, i) => ({
    symbol: 'BBCA',
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    close: 10000 + i * 100,
    volume: 50000,
  }))

  const sma = calculatePriceSma20(rows)
  assert.equal(sma.length, 15)
  assert.ok(sma.every((v) => v === null))
})

test('calculatePriceSma20 includes the current close from the twentieth session', () => {
  // 25 rows with close price = 1000
  const rows = Array.from({ length: 25 }, (_, i) => ({
    symbol: 'BBCA',
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    close: 1000 + i,
    volume: 50000,
  }))

  const sma = calculatePriceSma20(rows)
  assert.equal(sma.length, 25)
  // First 19 sessions cannot form a 20-session average.
  for (let i = 0; i < 19; i++) {
    assert.equal(sma[i], null)
  }
  assert.equal(sma[19], 1009.5)
  assert.equal(sma[20], 1010.5)
  assert.equal(sma[24], 1014.5)
})

test('getCompositeRiskPresentation correctly classifies scores and provides intuitive labels', () => {
  const normal = getCompositeRiskPresentation(34, 'NORMAL')
  assert.equal(normal.score, 34)
  assert.equal(normal.variant, 'low')
  assert.equal(normal.statusLabel, 'Rendah')
  assert.ok(normal.badgeClass.includes('emerald'))

  const warning = getCompositeRiskPresentation(45, 'WARNING')
  assert.equal(warning.variant, 'moderate')
  assert.equal(warning.statusLabel, 'Sedang')

  const high = getCompositeRiskPresentation(65, 'HIGH')
  assert.equal(high.variant, 'high')
  assert.equal(high.statusLabel, 'Tinggi')

  const critical = getCompositeRiskPresentation(80, 'CRITICAL')
  assert.equal(critical.variant, 'critical')
  assert.equal(critical.statusLabel, 'Kritis')

  const empty = getCompositeRiskPresentation(null)
  assert.equal(empty.variant, 'insufficient')
  assert.equal(empty.scoreText, '—')
})

test('getVolumeSpikePresentation formats ratios and sets appropriate variants', () => {
  const normal = getVolumeSpikePresentation(1.25, 'NORMAL')
  assert.equal(normal.variant, 'normal')
  assert.equal(normal.statusLabel, 'Normal')
  assert.ok(normal.ratioText.includes('1,25') || normal.ratioText.includes('1.25'))

  const high = getVolumeSpikePresentation(1.8, 'HIGH')
  assert.equal(high.variant, 'high')
  assert.equal(high.statusLabel, 'Ramai')

  const extreme = getVolumeSpikePresentation(3.1, 'EXTREME')
  assert.equal(extreme.variant, 'extreme')
  assert.equal(extreme.statusLabel, 'Ekstrem')

  const low = getVolumeSpikePresentation(0.4, 'LOW')
  assert.equal(low.variant, 'low')
  assert.equal(low.statusLabel, 'Sepi')

  const empty = getVolumeSpikePresentation(null)
  assert.equal(empty.variant, 'insufficient')
  assert.equal(empty.ratioText, '—')
})

test('getBandarmologyPresentation formats bandar status and foreign flow', () => {
  const pres = getBandarmologyPresentation('NORMAL_ACCUMULATION', 'HEAVY_INFLOW')
  assert.equal(pres.bandarLabel, 'Akumulasi Wajar')
  assert.equal(pres.bandarVariant, 'bullish')
  assert.equal(pres.foreignLabel, 'Beli Masif')
  assert.equal(pres.foreignVariant, 'heavy-inflow')
  assert.ok(pres.shortDescription.includes('Broker'))

  const distribution = getBandarmologyPresentation('BIG_DISTRIBUTION', 'HEAVY_OUTFLOW')
  assert.equal(distribution.bandarLabel, 'Distribusi Besar')
  assert.equal(distribution.bandarVariant, 'strong-bearish')
  assert.equal(distribution.foreignLabel, 'Jual Masif')
  assert.equal(distribution.foreignVariant, 'heavy-outflow')
})

test('getQuickMarketSummary produces coherent, human-friendly Indonesian sentence', () => {
  const summary = getQuickMarketSummary({
    ticker: 'BBCA',
    score: 34,
    scoreStatus: 'NORMAL',
    spikeRatio: 1.25,
    bandarStatus: 'NORMAL_ACCUMULATION',
    foreignFlowStatus: 'HEAVY_INFLOW',
  })
  assert.ok(summary.includes('BBCA'))
  assert.ok(summary.includes('risiko tergolong rendah'))
  assert.ok(summary.includes('34/100'))
  assert.ok(summary.includes('volume transaksi bergerak wajar'))
  assert.ok(summary.includes('akumulasi'))
})

