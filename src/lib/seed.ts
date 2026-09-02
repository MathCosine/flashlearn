import { bulkCreateCards, createSet } from './api'

/**
 * A few starter sets that show what the app can do: structured Latin
 * dictionary entries, LaTeX in a science set, and a plain two-sided set.
 */
export async function seedSampleSets(): Promise<void> {
  const latin = await createSet({
    name: 'Sample · Latin vocabulary',
    description: 'Head word on the front, full dictionary entry on the back.',
    category: 'Latin',
    tags: ['sample'],
    extra_fields: [
      { key: 'forms', label: 'Full forms' },
      { key: 'gender', label: 'Gender' },
      { key: 'family', label: 'Declension / Conjugation' },
      { key: 'derivatives', label: 'English derivatives' },
    ],
  })

  await bulkCreateCards(latin.id, [
    {
      front: 'agricola',
      back: 'farmer',
      extra_data: {
        forms: 'agricola, agricolae',
        gender: 'm',
        family: '1st declension noun',
        derivatives: 'agriculture, agrarian',
      },
    },
    {
      front: 'puella',
      back: 'girl',
      extra_data: {
        forms: 'puella, puellae',
        gender: 'f',
        family: '1st declension noun',
      },
    },
    {
      front: 'amō',
      back: 'to love, to like',
      extra_data: {
        forms: 'amō, amāre, amāvī, amātum',
        family: '1st conjugation verb',
        derivatives: 'amorous, amiable',
      },
    },
    {
      front: 'videō',
      back: 'to see',
      extra_data: {
        forms: 'videō, vidēre, vīdī, vīsum',
        family: '2nd conjugation verb',
        derivatives: 'video, vision',
      },
    },
    {
      front: 'rēx',
      back: 'king',
      extra_data: {
        forms: 'rēx, rēgis',
        gender: 'm',
        family: '3rd declension noun',
        derivatives: 'regal, regent',
      },
    },
    {
      front: 'terra',
      back: 'land, earth',
      extra_data: {
        forms: 'terra, terrae',
        gender: 'f',
        family: '1st declension noun',
        derivatives: 'terrain, terrestrial',
      },
    },
  ])

  const physics = await createSet({
    name: 'Sample · Formulas with math',
    description:
      'Shows LaTeX support — write math between dollar signs and it renders properly.',
    category: 'Science',
    tags: ['sample'],
    extra_fields: [{ key: 'note', label: 'Note' }],
  })

  await bulkCreateCards(physics.id, [
    {
      front: "Newton's second law",
      back: '$F = ma$',
      extra_data: { note: 'Force equals mass times acceleration' },
    },
    {
      front: 'Quadratic formula',
      back: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
      extra_data: { note: 'Roots of $ax^2 + bx + c = 0$' },
    },
    {
      front: 'Area of a circle',
      back: '$A = \\pi r^2$',
      extra_data: {},
    },
    {
      front: "Euler's identity",
      back: '$e^{i\\pi} + 1 = 0$',
      extra_data: {},
    },
  ])
}
