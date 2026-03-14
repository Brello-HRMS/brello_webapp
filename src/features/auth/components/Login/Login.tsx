import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import { Input } from '../../../../components/ui/Input/Input';
import { Button } from '../../../../components/ui/Button/Button';
import { useLoginWithOTP } from '../../api/useLogin';

import styles from './Login.module.scss';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    mutate: loginWithOTP,
    isPending: isLoginWithOTPPending,
    error: loginWithOTPError,
  } = useLoginWithOTP({
    onSuccess: () => {
      const email = getValues('email');
      navigate('/auth/otp', { state: { email, resource: 'login' } });
    },
    onError: (_err) => {
      // Error is handled by the UI via loginWithOTPError
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginWithOTP({
      email: data.email,
    });
  };

  return (
    <div className={styles.container}>
      <AuthFormWrapper
        title="Manage employees easily starting from now"
        subtitle="Get started for free today!"
        onSubmit={handleSubmit(onSubmit)}
        showSocials={true}
        socialDividerText="Or login with"
      >
        <div className={styles.formBody}>
          <Input
            label="Email Id"
            type="email"
            placeholder="example@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {loginWithOTPError && (
            <p className={styles.errorMessage}>
              {loginWithOTPError.message || 'Login failed. Please try again.'}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className={styles.submitBtn}
            disabled={isLoginWithOTPPending}
          >
            {isLoginWithOTPPending ? 'Sending...' : 'Send OTP'}
          </Button>
        </div>
      </AuthFormWrapper>
    </div>
  );
};
