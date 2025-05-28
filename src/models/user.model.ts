import { PrismaClient, User, AuthProvider } from "../generated/prisma/client";
// import { AuthProvider } from "../enums/auth-provider.enum";

const prisma = new PrismaClient();

type CreateUserInput = {
  email: string;
  password: string | null;
  name: string;
  avatar?: string;
  provider: AuthProvider; // <-- dùng enum bạn tự định nghĩa
};

type UpdateUserInput = Partial<CreateUserInput>;

class UserModel {
  // Tạo user mới
  async create(data: CreateUserInput): Promise<User> {
    return await prisma.user.create({ data });
  }

  // Tìm user theo email
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  // Tìm user theo ID
  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  // Lấy tất cả user
  async findAll(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  // Cập nhật user
  async update(id: number, data: UpdateUserInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // Xóa user
  async delete(id: number): Promise<User> {
    return await prisma.user.delete({ where: { id } });
  }
}

export default new UserModel();
