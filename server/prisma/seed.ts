import { PrismaClient, Role, ComplaintPriority, ComplaintStatus, DueStatus, PaymentVerification, NoticePriority } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Safeguard against accidental wipe in production
  const existingFlats = await prisma.flat.count();
  if (existingFlats > 0 && process.env.FORCE_SEED !== 'true') {
    console.log(`⚠️ Database already contains ${existingFlats} flats. Skipping seed to prevent accidental data loss.`);
    console.log('💡 Set FORCE_SEED=true to reset and reseed all data.');
    return;
  }

  // Clear existing records safely
  await prisma.feedback.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.maintenanceDue.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.flat.deleteMany();
  await prisma.user.deleteMany();
  await prisma.maintenanceConfig.deleteMany();

  // 2. Setup Maintenance Config
  const config = await prisma.maintenanceConfig.create({
    data: {
      baseFixedCharge: 500.00,
      ratePerSqFt: 2.50,
      dueDayOfMonth: 5,
      lateFeeFlat: 100.00,
      bankAccountName: 'Royal Orchid RWA',
      bankAccountNumber: '923010049281729',
      bankIfscCode: 'HDFC0001234',
      upiId: 'royalorchid.rwa@hdfcbank'
    }
  });
  console.log('✅ Maintenance configuration created');

  // Password hashes
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const residentDefaultHash = await bcrypt.hash('resident123', 10);
  const staffPasswordHash = await bcrypt.hash('staff123', 10);

  // 3. Create Admin & Staff Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mygate.local',
      fullName: 'Rajesh Sharma (Secretary / Treasurer)',
      phone: '+91 98765 43210',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@mygate.local',
      fullName: 'Ramesh Kumar (Electrician & Plumber)',
      phone: '+91 98111 22334',
      passwordHash: staffPasswordHash,
      role: Role.STAFF
    }
  });
  console.log('✅ Admin & Staff created');

  // 4. Create 24 Flats and their Residents (6 units per floor across 4 floors)
  const flatsData = [
    // Floor 1
    { unit: '101', floor: 1, sqft: 1150, residentName: 'Amit Verma', phone: '+91 98201 10001' },
    { unit: '102', floor: 1, sqft: 1200, residentName: 'Pooja Nair', phone: '+91 98201 10002' },
    { unit: '103', floor: 1, sqft: 980, residentName: 'Karthik Iyer', phone: '+91 98201 10003' },
    { unit: '104', floor: 1, sqft: 1150, residentName: 'Rohan Kulkarni', phone: '+91 98201 10004' },
    { unit: '105', floor: 1, sqft: 1200, residentName: 'Meera Sen', phone: '+91 98201 10005' },
    { unit: '106', floor: 1, sqft: 980, residentName: 'Arvind Swamy', phone: '+91 98201 10006' },

    // Floor 2
    { unit: '201', floor: 2, sqft: 1150, residentName: 'Sunil Deshmukh', phone: '+91 98201 10007' },
    { unit: '202', floor: 2, sqft: 1200, residentName: 'Neha Gupta', phone: '+91 98201 10008' },
    { unit: '203', floor: 2, sqft: 980, residentName: 'Adarsh Singh', phone: '+91 98201 10009' },
    { unit: '204', floor: 2, sqft: 1150, residentName: 'Priya Bansal', phone: '+91 98201 10010' },
    { unit: '205', floor: 2, sqft: 1200, residentName: 'Harish Bhat', phone: '+91 98201 10011' },
    { unit: '206', floor: 2, sqft: 980, residentName: 'Sangeeta Rao', phone: '+91 98201 10012' },

    // Floor 3
    { unit: '301', floor: 3, sqft: 1150, residentName: 'Vikram Patel', phone: '+91 98201 10013' },
    { unit: '302', floor: 3, sqft: 1200, residentName: 'Ananya Roy', phone: '+91 98201 10014' },
    { unit: '303', floor: 3, sqft: 980, residentName: 'Deepak Joshi', phone: '+91 98201 10015' },
    { unit: '304', floor: 3, sqft: 1150, residentName: 'Tanvi Chawla', phone: '+91 98201 10016' },
    { unit: '305', floor: 3, sqft: 1200, residentName: 'Nikhil Mehra', phone: '+91 98201 10017' },
    { unit: '306', floor: 3, sqft: 980, residentName: 'Farhan Siddiqui', phone: '+91 98201 10018' },

    // Floor 4
    { unit: '401', floor: 4, sqft: 1150, residentName: 'Suresh Menon', phone: '+91 98201 10019' },
    { unit: '402', floor: 4, sqft: 1200, residentName: 'Kavita Reddy', phone: '+91 98201 10020' },
    { unit: '403', floor: 4, sqft: 980, residentName: 'Manish Agarwal', phone: '+91 98201 10021' },
    { unit: '404', floor: 4, sqft: 1150, residentName: 'Shalini Saxena', phone: '+91 98201 10022' },
    { unit: '405', floor: 4, sqft: 1200, residentName: 'Varun Kapoor', phone: '+91 98201 10023' },
    { unit: '406', floor: 4, sqft: 980, residentName: 'Divya Pillai', phone: '+91 98201 10024' },
  ];

  const createdFlats: any[] = [];
  const createdResidents: any[] = [];

  for (const f of flatsData) {
    const flatUser = await prisma.user.create({
      data: {
        email: `flat${f.unit}@mygate.local`,
        fullName: f.residentName,
        phone: f.phone,
        passwordHash: residentDefaultHash,
        role: Role.RESIDENT
      }
    });
    createdResidents.push(flatUser);

    const flat = await prisma.flat.create({
      data: {
        unitNumber: f.unit,
        floorNumber: f.floor,
        superBuiltUpSqFt: f.sqft,
        carpetSqFt: Math.round(f.sqft * 0.8),
        residentId: flatUser.id,
        occupancyType: 'OWNER',
        occupantCount: 2
      }
    });
    await prisma.user.update({
      where: { id: flatUser.id },
      data: { flatId: flat.id }
    });
    createdFlats.push(flat);
  }
  console.log(`✅ 24 Flats & Primary Resident accounts created`);

  // 5. Generate Monthly Dues for current period ("2026-10")
  const currentPeriod = '2026-10';
  const dueDate = new Date('2026-10-05T23:59:59.000Z');

  for (let i = 0; i < createdFlats.length; i++) {
    const flat = createdFlats[i];
    const fixed = 500;
    const variable = Number((flat.superBuiltUpSqFt * 2.50).toFixed(2));
    const total = fixed + variable;

    // Simulate diverse status:
    // Paid units: 101, 102, 203, 301, 305, 404
    // Submitted for verification: 201, 304
    // Others still pending
    let dueStatus: DueStatus = DueStatus.PENDING;
    if (['101', '102', '203', '301', '305', '404'].includes(flat.unitNumber)) {
      dueStatus = DueStatus.PAID;
    } else if (['201', '304'].includes(flat.unitNumber)) {
      dueStatus = DueStatus.SUBMITTED_FOR_VERIFICATION;
    }

    const due = await prisma.maintenanceDue.create({
      data: {
        flatId: flat.id,
        billingPeriod: currentPeriod,
        sqFtRate: 2.50,
        areaSqFt: flat.superBuiltUpSqFt,
        fixedCharge: fixed,
        variableCharge: variable,
        totalDue: total,
        dueDate: dueDate,
        status: dueStatus
      }
    });

    if (dueStatus === DueStatus.PAID) {
      await prisma.payment.create({
        data: {
          dueId: due.id,
          amountPaid: total,
          paymentMethod: 'UPI',
          utrNumber: `UTR2610${flat.unitNumber}9827`,
          verificationStatus: PaymentVerification.VERIFIED,
          receiptNumber: `RCP-202610-${flat.unitNumber}`,
          verifiedAt: new Date(),
          paidAt: new Date('2026-10-03T11:20:00Z')
        }
      });
    } else if (dueStatus === DueStatus.SUBMITTED_FOR_VERIFICATION) {
      await prisma.payment.create({
        data: {
          dueId: due.id,
          amountPaid: total,
          paymentMethod: 'UPI',
          utrNumber: `UPI40918239${flat.unitNumber}`,
          verificationStatus: PaymentVerification.PENDING,
          paidAt: new Date('2026-10-04T16:45:00Z')
        }
      });
    }
  }
  console.log('✅ Generated October 2026 Dues & Payments');

  // 6. Seed Expenses
  await prisma.expense.createMany({
    data: [
      {
        title: 'Municipal Water Tanker (2 loads x 6,000L)',
        category: 'WATER',
        amount: 2400.00,
        expenseDate: new Date('2026-10-02'),
        vendorName: 'Balaji Water Suppliers',
        recordedById: adminUser.id
      },
      {
        title: 'Monthly Common Area & Staircase Deep Cleaning',
        category: 'CLEANING',
        amount: 3500.00,
        expenseDate: new Date('2026-10-01'),
        vendorName: 'ShineCare Facility Services',
        recordedById: adminUser.id
      },
      {
        title: 'Lift Monthly AMC & Lubrication Check',
        category: 'LIFT_AMC',
        amount: 4200.00,
        expenseDate: new Date('2026-10-04'),
        vendorName: 'Johnson Lifts Pvt Ltd',
        recordedById: adminUser.id
      },
      {
        title: 'Terrace Overhead Water Pump Sensor Replacement',
        category: 'REPAIRS',
        amount: 1850.00,
        expenseDate: new Date('2026-10-07'),
        vendorName: 'Standard Electric Works',
        recordedById: adminUser.id
      }
    ]
  });
  console.log('✅ Seeded society expenses');

  // 7. Seed Complaints
  const flat203 = createdFlats.find(f => f.unitNumber === '203');
  const user203 = createdResidents.find(r => r.email === 'flat203@mygate.local');
  const flat402 = createdFlats.find(f => f.unitNumber === '402');
  const user402 = createdResidents.find(r => r.email === 'flat402@mygate.local');

  if (flat203 && user203) {
    await prisma.complaint.create({
      data: {
        flatId: flat203.id,
        createdById: user203.id,
        title: 'Staircase 2nd floor light fixture flickering',
        description: 'The LED tube near the lift entrance on the 2nd floor is flickering continuously.',
        category: 'ELECTRICAL',
        priority: ComplaintPriority.MEDIUM,
        status: ComplaintStatus.ASSIGNED,
        preferredSlot: 'Anytime',
        assignedTo: 'Ramesh Kumar (Electrician)'
      }
    });
  }

  if (flat402 && user402) {
    await prisma.complaint.create({
      data: {
        flatId: flat402.id,
        createdById: user402.id,
        title: 'Low water pressure in kitchen line during morning hours',
        description: 'Noticeable drop in water pressure between 7 AM and 9 AM. Overhead booster pump may need inspection.',
        category: 'PLUMBING',
        priority: ComplaintPriority.HIGH,
        status: ComplaintStatus.IN_PROGRESS,
        preferredSlot: 'Morning 9:00 AM - 11:00 AM',
        assignedTo: 'Ramesh Kumar (Plumber)'
      }
    });
  }
  console.log('✅ Seeded initial complaints');

  // 8. Seed Notices
  await prisma.notice.createMany({
    data: [
      {
        title: 'Overhead Water Tank Cleaning Scheduled',
        content: 'Dear Residents, the society overhead water tanks will undergo quarterly chemical scrubbing and disinfection on Saturday, 18-Oct from 9:00 AM to 1:00 PM. Water supply will remain suspended during this window. Please store adequate water beforehand.',
        category: 'WATER',
        priority: NoticePriority.URGENT,
        pinned: true,
        publishedById: adminUser.id
      },
      {
        title: 'Terrace Access Rules & Solar Inverter Notice',
        content: 'Residents are kindly reminded that terrace gates are kept open between 6:00 AM and 10:00 PM. Please ensure the terrace door is latched after evening walks. Do not place heavy pots near the solar inverter wiring zone.',
        category: 'GENERAL',
        priority: NoticePriority.IMPORTANT,
        pinned: true,
        publishedById: adminUser.id
      },
      {
        title: 'RWA Monthly General Meeting (AGM) Announcement',
        content: 'A brief 30-minute informal meeting is scheduled on Sunday, 26-Oct at 6:00 PM on the 1st-floor lobby to discuss the festival lighting budget and CCTV camera addition at the front gate.',
        category: 'MEETING',
        priority: NoticePriority.NORMAL,
        pinned: false,
        publishedById: adminUser.id
      }
    ]
  });
  console.log('✅ Seeded society notices');

  console.log('\n🎉 Seeding complete! Login credentials:');
  console.log('----------------------------------------------------');
  console.log('ADMIN:    admin@mygate.local      / admin123');
  console.log('RESIDENTS: flat101@mygate.local ... flat406@mygate.local / resident123');
  console.log('STAFF:    staff@mygate.local      / staff123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
