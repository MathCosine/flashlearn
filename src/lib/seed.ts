import { bulkCreateCards, createSet } from './api'
import type { FlashSet } from '../types'

// A small sample set showing how to use the optional extra fields, modeled
// on the standard "head word on front, full dictionary entry on back"
// format used for Latin vocabulary flashcards. Not tied to any specific
// textbook — just enough well-known words to demonstrate the format.
export async function seedSampleSet(): Promise<FlashSet> {
  const set = await createSet({
    name: 'Sample: Latin Vocabulary',
    description:
      'A demo set showing the front/back + extra-fields format. Edit or delete freely.',
    category: 'Latin',
    tags: ['sample'],
    extra_fields: [
      { key: 'forms', label: 'Full forms' },
      { key: 'gender', label: 'Gender' },
      { key: 'family', label: 'Declension / Conjugation' },
      { key: 'derivatives', label: 'English derivatives' },
    ],
    strict_answers: false,
  })

  await bulkCreateCards(set.id, [
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
      back: 'to love',
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
  ])

  return set
}
