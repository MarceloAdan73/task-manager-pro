const { PrismaClient, Priority } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@taskmanager.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  })
  
  console.log('✅ Usuario demo creado:', demoUser.email)

  const tasks = [
    {
      title: 'Configurar PostgreSQL',
      description: 'Conectar backend con base de datos real',
      priority: Priority.HIGH,
      completed: true,
      userId: demoUser.id,
    },
    {
      title: 'Implementar Prisma ORM',
      description: 'Crear modelos y migraciones',
      priority: Priority.HIGH,
      completed: true,
      userId: demoUser.id,
    },
    {
      title: 'Implementar autenticación JWT',
      description: 'Sistema de login para usuarios',
      priority: Priority.URGENT,
      completed: false,
      userId: demoUser.id,
    },
    {
      title: 'Testear endpoints con base de datos',
      description: 'Verificar que todo funcione correctamente',
      priority: Priority.MEDIUM,
      completed: false,
      userId: demoUser.id,
    },
    {
      title: 'Documentar decisiones técnicas',
      description: 'Actualizar README con nueva arquitectura',
      priority: Priority.LOW,
      completed: false,
      userId: demoUser.id,
    },
  ]

  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: taskData,
    })
    console.log('✅ Tarea creada:', task.title)
  }

  const taskCount = await prisma.task.count()
  console.log('\n🎉 Seed completado exitosamente!')
  console.log('📊 Total de tareas en BD:', taskCount)
  console.log('\n🔑 Credenciales de acceso:')
  console.log('   Email: demo@taskmanager.com')
  console.log('   Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })