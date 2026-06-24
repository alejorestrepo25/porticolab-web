import { createClient } from '@sanity/client'
import { createReadStream, readdirSync, existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: '32sykluw',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skHP0Wj8S8Y6Iurnn5KiVuy8cPOswSYCSuov6eWm1mU8oJW7IKralO1Ug5WfO3M9G0edTTX1ceCc18pp8z2OXihtGNB3CA6YF1A92V74JpOwn7558KjBJapkfrmJLKb1hoflQResI1tJspTH4w5bG9ihOF6w7dLMww2A5D97VUmEWd8hcsGl',
  useCdn: false,
})

async function uploadImage(imagePath) {
  if (!existsSync(imagePath)) return null
  console.log(`  Subiendo imagen: ${path.basename(imagePath)}`)
  const asset = await client.assets.upload('image', createReadStream(imagePath), {
    filename: path.basename(imagePath),
  })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function migratePost(postFolder, index) {
  const folderPath = path.join(__dirname, 'publicaciones', postFolder)
  const dataPath = path.join(folderPath, 'data.json')

  if (!existsSync(dataPath)) {
    console.log(`⚠️  Sin data.json en ${postFolder}, saltando...`)
    return
  }

  const raw = await readFile(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  console.log(`\n📦 Migrando: ${data.title || postFolder}`)

  // Subir portada
  const portadaPath = path.join(folderPath, 'portada.jpg')
  const portada = await uploadImage(portadaPath)

  // Subir galería
  const galeria = []
  for (const imgName of (data.images || [])) {
    if (imgName === 'portada.jpg') continue
    const imgPath = path.join(folderPath, imgName)
    const img = await uploadImage(imgPath)
    if (img) galeria.push(img)
  }

  // Crear slug limpio
  const slugText = (data.title || `proyecto-${index}`)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const doc = {
    _type: 'proyecto',
    title: data.title || `Proyecto ${index}`,
    slug: { _type: 'slug', current: slugText },
    location: data.location || '',
    year: typeof data.year === 'number' ? data.year : parseInt(data.year) || null,
    description: data.description || '',
    features: data.features || [],
    tags: (data.tags || []).map(t =>
      t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    ),
    disponible: false,
  }

  if (portada) doc.portada = portada
  if (galeria.length > 0) doc.galeria = galeria

  const created = await client.create(doc)
  await client.patch(created._id).set({}).commit()
  // Publicar el documento
  await client.action({
    actionType: 'sanity.action.document.publish',
    draftId: `drafts.${created._id}`,
    publishedId: created._id,
  }).catch(() => {}) // ignorar si ya está publicado

  console.log(`  ✅ Creado: ${created._id}`)
}

async function main() {
  const pubDir = path.join(__dirname, 'publicaciones')
  const folders = readdirSync(pubDir).filter(f => f.startsWith('post ('))

  console.log(`🚀 Migrando ${folders.length} posts a Sanity...\n`)

  for (let i = 0; i < folders.length; i++) {
    await migratePost(folders[i], i + 1)
  }

  console.log('\n🎉 Migración completada!')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
