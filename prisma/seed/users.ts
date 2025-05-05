import { PrismaClient, Gender } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/id_ID';
import * as bcrypt from 'bcrypt';

// University faculties and programs
const faculties = [
  { name: 'Fakultas Ilmu Komputer', programs: ['Teknik Informatika', 'Sistem Informasi', 'Data Science'] },
  { name: 'Fakultas Ekonomi', programs: ['Manajemen', 'Akuntansi', 'Ekonomi Pembangunan'] },
  { name: 'Fakultas Teknik', programs: ['Teknik Sipil', 'Teknik Elektro', 'Teknik Mesin'] },
  { name: 'Fakultas Hukum', programs: ['Ilmu Hukum'] },
  { name: 'Fakultas Kedokteran', programs: ['Pendidikan Dokter', 'Farmasi', 'Gizi'] },
  { name: 'Fakultas Psikologi', programs: ['Psikologi'] }
];

/**
 * Generate and create university student users
 */
export async function seedUsers(prisma: PrismaClient, count = 50) {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];
  
  console.log(`Generating ${count} users...`);
  
  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]);
    const faculty = faker.helpers.arrayElement(faculties);
    const program = faker.helpers.arrayElement(faculty.programs);
    const birthYear = faker.number.int({ min: 1998, max: 2005 });
    const birthDate = new Date(birthYear, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 }));
    const age = new Date().getFullYear() - birthYear;
    
    // Generate a unique 10-digit NIM (Student ID)
    const nim = `20${faker.string.numeric(8)}`;
    
    users.push({
      fullname: faker.person.fullName({ sex: gender === Gender.MALE ? 'male' : 'female' }),
      nim,
      email: `${nim}@student.university.ac.id`,
      password: hashedPassword,
      profilePicture: faker.image.avatar(),
      Photos: [faker.image.urlLoremFlickr({ category: 'people' }), faker.image.urlLoremFlickr({ category: 'people' })],
      bio: faker.helpers.maybe(() => faker.lorem.paragraph(1), { probability: 0.7 }),
      fakultas: faculty.name,
      prodi: program,
      dateOfBirth: birthDate,
      age,
      gender,
      alamat: faker.location.streetAddress(),
      interestedInGender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE, Gender.ALL]),
      minAgePreference: faker.helpers.maybe(() => faker.number.int({ min: 18, max: 23 }), { probability: 0.7 }),
      maxAgePreference: faker.helpers.maybe(() => faker.number.int({ min: 19, max: 25 }), { probability: 0.7 }),
      verified: true,
      isActive: true
    });
  }
  
  // Create users in batches to improve performance
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await prisma.user.createMany({
      data: batch,
      skipDuplicates: true
    });
  }
  
  console.log(`Created ${users.length} users`);
  return await prisma.user.findMany();
}