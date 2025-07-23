// container.ts
import 'reflect-metadata';
import { container } from 'tsyringe';
import  UserService  from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import {AuthService}  from '../services/auth.service';
import { AuthRepository } from '@/repositories/auth.repository';

container.register(UserRepository, { useClass: UserRepository });
container.register(AuthRepository, { useClass: AuthRepository });
container.register(AuthService, { useClass: AuthService });
container.register(UserService, { useClass: UserService });