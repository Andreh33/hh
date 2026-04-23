import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Admin por defecto
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin123@crm.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin123@crm.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })
  console.log('Admin creado:', admin.email)

  // Usuario de demostración
  const userPassword = await hash('user123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@crm.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'demo@crm.com',
      password: userPassword,
      role: Role.USER,
    },
  })
  console.log('Usuario demo creado:', demoUser.email)

  // Leads de ejemplo para el usuario demo
  const leadsData = [
    {
      businessName: 'Tech Solutions SL',
      clientName: 'Carlos Martínez',
      response: 'Interesado',
      shouldCall: true,
      callDateTime: new Date('2025-02-01T10:00:00'),
      hasSeenDemo: true,
      wantsCustomDemo: false,
      notes: 'Presupuesto hasta 5000€',
      issues: 'Precio elevado',
      phone: '+34 612 345 678',
      email: 'carlos@techsolutions.es',
      commercialName: 'Ana García',
      order: 0,
    },
    {
      businessName: 'Innovate Corp',
      clientName: 'María López',
      response: 'Pendiente de respuesta',
      shouldCall: false,
      hasSeenDemo: false,
      wantsCustomDemo: true,
      notes: 'Enviar catálogo',
      issues: '',
      phone: '+34 699 876 543',
      email: 'maria@innovatecorp.com',
      commercialName: 'Pedro Ruiz',
      order: 1,
    },
    {
      businessName: 'Global Trade SA',
      clientName: 'Roberto Fernández',
      response: 'No interesado',
      shouldCall: false,
      hasSeenDemo: true,
      wantsCustomDemo: false,
      notes: 'Volver a contactar en 3 meses',
      issues: 'Ya tienen solución contratada',
      phone: '+34 654 321 098',
      email: 'roberto@globaltrade.es',
      commercialName: 'Ana García',
      order: 2,
    },
  ]

  for (const lead of leadsData) {
    await prisma.lead.create({
      data: {
        ...lead,
        userId: demoUser.id,
      },
    })
  }
  console.log('Leads de ejemplo creados')

  console.log('\n✅ Seed completado.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Credenciales:')
  console.log('  Admin  → admin123@crm.com / admin123')
  console.log('  Demo   → demo@crm.com / user123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
