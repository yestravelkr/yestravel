import { DataSource } from 'typeorm';
import { AdminEntity } from '@src/module/backoffice/domain/admin.entity';
import { RoleEnum } from '@src/module/backoffice/admin/admin.schema';

export async function seedAdmin(dataSource: DataSource) {
  const adminRepository = dataSource.getRepository(AdminEntity);

  // 이미 존재하는지 확인
  const existingAdmin = await adminRepository.findOne({
    where: { email: 'admin@yestravel.co.kr' },
  });

  if (existingAdmin) {
    console.log('✅ Admin account already exists');
    return;
  }

  // 새 어드민 생성
  const admin = new AdminEntity();
  admin.email = 'admin@yestravel.co.kr';
  admin.name = 'Admin';
  admin.phoneNumber = '010-0000-0000';
  admin.role = RoleEnum.ADMIN_SUPER;
  await admin.setPassword('admin1234');

  await adminRepository.save(admin);

  console.log('✅ Admin account created successfully');
  console.log('   Email: admin@yestravel.co.kr');
  console.log('   Password: admin1234');
  console.log('   Role: ADMIN_SUPER');
}