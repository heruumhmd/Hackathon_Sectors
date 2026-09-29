import test from 'node:test'
import assert from 'node:assert/strict'

// Verify constellation nodes & path integrity for RASI identity
import {
  RASI_CONSTELLATION_NODES,
  RASI_SATELLITE_NODES,
  RASI_PATH_D,
  RASI_HERO_STAR,
  RASI_3D_ORBIT,
} from '../components/logo/constants.ts'

test('RASI Brand Identity - S-Constellation geometry', async (t) => {
  await t.test('has 9 constellation nodes tracing the abstract S', () => {
    assert.equal(RASI_CONSTELLATION_NODES.length, 9)
  })

  await t.test('contains exactly 1 focal primary star node (breakout pivot)', () => {
    const primaryNodes = RASI_CONSTELLATION_NODES.filter((n) => n.isPrimary)
    assert.equal(primaryNodes.length, 1)
    assert.equal(primaryNodes[0].id, 'n4')
    assert.equal(primaryNodes[0].x, 46)
    assert.equal(primaryNodes[0].y, 60)
  })

  await t.test('all nodes have positive coordinates and radii', () => {
    for (const node of RASI_CONSTELLATION_NODES) {
      assert.ok(node.x > 0 && node.x < 100, `node.x within bounds: ${node.x}`)
      assert.ok(node.y > 0 && node.y < 120, `node.y within bounds: ${node.y}`)
      assert.ok(node.r >= 3, `node.r >= 3: ${node.r}`)
    }
  })

  await t.test('satellite nodes are defined', () => {
    assert.equal(RASI_SATELLITE_NODES.length, 3)
  })

  await t.test('RASI_PATH_D begins and ends at valid endpoints of the S curve', () => {
    assert.ok(RASI_PATH_D.startsWith('M 76 20'))
    assert.ok(RASI_PATH_D.endsWith('22 98'))
  })

  await t.test('3D hero star facets are aligned with pivot center', () => {
    assert.equal(RASI_HERO_STAR.id, 'n4')
    assert.equal(RASI_HERO_STAR.facets.center.x, 46)
    assert.equal(RASI_HERO_STAR.facets.center.y, 60)
    assert.equal(RASI_HERO_STAR.facets.top.x, 46)
    assert.ok(RASI_HERO_STAR.facets.top.y < 60)
    assert.equal(RASI_HERO_STAR.facets.bottom.x, 46)
    assert.ok(RASI_HERO_STAR.facets.bottom.y > 60)
    assert.ok(RASI_HERO_STAR.facets.left.x < 46)
    assert.equal(RASI_HERO_STAR.facets.left.y, 60)
    assert.ok(RASI_HERO_STAR.facets.right.x > 46)
    assert.equal(RASI_HERO_STAR.facets.right.y, 60)
  })

  await t.test('3D orbital parameters define valid ellipse', () => {
    assert.equal(RASI_3D_ORBIT.cx, 46)
    assert.equal(RASI_3D_ORBIT.cy, 60)
    assert.ok(RASI_3D_ORBIT.rx > RASI_3D_ORBIT.ry)
  })

  await t.test('Multi-axis gyroscopic rings define concentric armillary geometry', async () => {
    const { RASI_GYRO_RINGS, RASI_LOCAL_ORBITS, RASI_SYMBOL_SPARKLES } = await import(
      '../components/logo/constants.ts'
    )
    assert.ok(RASI_GYRO_RINGS.primary.rx > 0)
    assert.ok(RASI_GYRO_RINGS.secondary.rx > 0)
    assert.ok(RASI_GYRO_RINGS.tertiary.rx > 0)
    assert.ok(RASI_GYRO_RINGS.equatorial.rx > 0)
    assert.ok(RASI_GYRO_RINGS.innerHarmonic.rx > 0)
    assert.ok(RASI_GYRO_RINGS.outerAstrolabe.rx > 0)

    assert.ok(RASI_LOCAL_ORBITS.length >= 4)
    assert.ok(RASI_SYMBOL_SPARKLES.length >= 5)
    // Ensure hero sparkle is at pivot n4
    const heroSparkle = RASI_SYMBOL_SPARKLES.find((s) => s.id === 'sp-hero')
    assert.ok(heroSparkle)
    assert.equal(heroSparkle.x, 46)
    assert.equal(heroSparkle.y, 60)
  })
})

