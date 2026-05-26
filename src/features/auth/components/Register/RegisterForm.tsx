import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useRegister } from '../../api/useRegister';
import { useCheckAvailability } from '../../api/useCheckAvailability';
import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import elementsStyles from '../AuthFormWrapper/AuthFormElements.module.scss';
import { Input } from '../../../../components/ui/Input/Input';
import { PhoneInput } from '../../../../components/ui/PhoneInput/PhoneInput';
import { Button } from '../../../../components/ui/Button/Button';

import styles from './RegisterForm.module.scss';

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const { mutate: registerLead, isPending, error: apiError } = useRegister();

  const planId = queryParams.get('plan_id');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
    control,
  } = useForm<RegisterFormData>({
    mode: 'onTouched',
  });

  const emailValue = useWatch({ control, name: 'email' });
  const phoneValue = useWatch({ control, name: 'phone' });

  const { mutate: checkAvailability } = useCheckAvailability();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const email =
        emailValue && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailValue)
          ? emailValue
          : undefined;
      const phone = phoneValue && /^[0-9]{10}$/.test(phoneValue) ? phoneValue : undefined;

      if (email || phone) {
        checkAvailability(
          { email, phone },
          {
            onSuccess: (data) => {
              if (email) {
                if (!data.emailAvailable) {
                  setError('email', {
                    type: 'manual',
                    message: 'This email is already registered',
                  });
                } else if (errors.email?.type === 'manual') {
                  clearErrors('email');
                }
              }
              if (phone) {
                if (!data.phoneAvailable) {
                  setError('phone', {
                    type: 'manual',
                    message: 'This phone is already registered',
                  });
                } else if (errors.phone?.type === 'manual') {
                  clearErrors('phone');
                }
              }
            },
          },
        );
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    emailValue,
    phoneValue,
    checkAvailability,
    setError,
    clearErrors,
    errors.email?.type,
    errors.phone?.type,
  ]);

  const onSubmit = (data: RegisterFormData) => {
    if (!planId) return;

    registerLead(
      {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        password: data.password,
        plan_id: queryParams.get('plan_id') || '',
        location: 'India',
        device: 'MacOS - Chrome',
        source: 'website',
      },
      {
        onSuccess: () => {
          navigate('/auth/otp', { state: { email: data.email } });
        },
      },
    );
  };

  return (
    <AuthFormWrapper
      title="Create your account."
      subtitle="Sign up to get started with Brello today!"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className={elementsStyles.row}>
        <Input
          label="First Name *"
          {...register('firstName', { required: 'First name is required' })}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name *"
          {...register('lastName', { required: 'Last name is required' })}
          error={errors.lastName?.message}
        />
      </div>

      <div className={elementsStyles.row}>
        <Input
          label="Work Email *"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          type="email"
          error={errors.email?.message}
        />
        <PhoneInput
          label="Phone number *"
          {...register('phone', {
            required: 'Phone is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Phone number must be exactly 10 digits',
            },
          })}
          error={errors.phone?.message}
        />
      </div>

      <Input
        label="Password *"
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Minimum 6 characters' },
        })}
        type="password"
        error={errors.password?.message}
      />

      <Input
        label="Confirm Password *"
        {...register('confirmPassword', {
          required: 'Please confirm password',
          validate: (value) => value === getValues('password') || 'Passwords do not match',
        })}
        type="password"
        error={errors.confirmPassword?.message}
      />

      <div className={elementsStyles.checkboxGroup}>
        <input
          type="checkbox"
          id="terms"
          {...register('agreeToTerms', { required: 'You must agree to the terms' })}
        />
        <label htmlFor="terms">
          I agree to the <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>.
        </label>
      </div>
      {errors.agreeToTerms && (
        <span className={elementsStyles.error}>{errors.agreeToTerms.message}</span>
      )}

      {apiError && (
        <span className={elementsStyles.error} style={{ display: 'block', marginBottom: '16px' }}>
          {(apiError as Error)?.message || 'Registration failed. Please try again.'}
        </span>
      )}

      <Button type="submit" variant="primary" disabled={isPending || !planId}>
        {isPending ? 'Registering...' : 'Continue'}
      </Button>

      <div className={styles.loginLink}>
        Already have an account? <span onClick={() => navigate('/auth/login')}>Log In</span>
      </div>
    </AuthFormWrapper>
  );
};
