import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import { Input } from '../../../../components/ui/Input/Input';
import { Button } from '../../../../components/ui/Button/Button';

import styles from './Login.module.scss';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    // In a real app, you would send this to your backend
    // console.log('Sending OTP to:', data.email);
    alert(`Sending OTP to ${data.email}`);
  };

  return (
    <div className={styles.container}>
      <AuthFormWrapper
        title="Manage employees easily starting from now"
        subtitle="Get started for free today!"
        onSubmit={handleSubmit(onSubmit)}
        showSocials={true}
        socialDividerText="Or register with"
      >
        <div className={styles.formBody}>
          <Input
            label="Email Id"
            type="email"
            placeholder="example@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" variant="primary" fullWidth className={styles.submitBtn}>
            Send OTP
          </Button>
        </div>
      </AuthFormWrapper>
    </div>
  );
};
