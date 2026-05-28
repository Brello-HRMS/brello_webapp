import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useVerifyOtp } from '../../api/useVerifyOtp';
import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import { Button } from '../../../../components/ui/Button/Button';
import elementsStyles from '../AuthFormWrapper/AuthFormElements.module.scss';
import { useVerifyLoginOtp } from '../../api/useLogin';
import { useResendOtp } from '../../api/useResendOtp';
import { showToast } from '../../../ToastFeature/ShowToast';

import styles from './OtpForm.module.scss';

import type { LoginResponse } from '../../api/authType';

export const OtpForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email as string | undefined;
  const resource = location.state?.resource as string | undefined;

  const { mutate: verifyOtp, isPending, error: apiError } = useVerifyOtp();

  const { mutate: verifyLoginOtp } = useVerifyLoginOtp();

  const { mutate: resendOtp, isPending: isResending, error: resendError } = useResendOtp();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(29);

  useEffect(() => {
    if (!email) {
      navigate('/auth/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleResend = () => {
    if (!email) return;

    const purpose = resource === 'login' ? 'LOGIN' : 'LEAD_VERIFICATION';

    resendOtp(
      { email, purpose },
      {
        onSuccess: () => {
          setTimeLeft(29);
          showToast('OTP resent successfully', 'success');
        },
      },
    );
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // When pressing backspace on an empty field, focus the previous one
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pastedData.some((char) => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((val) => val === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6 && email) {
      if (resource === 'login') {
        verifyLoginOtp(
          { email, otp: otpCode, device_fingerprint: 'admin_panel' },
          {
            onSuccess: (data: LoginResponse) => {
              const { user, setup_required } = data.data;
              sessionStorage.setItem('auth_response', JSON.stringify(data));
              if (user.is_platform_admin) {
                navigate('/platform/dashboard');
              } else if (setup_required) {
                navigate('/auth/lead', { state: { userId: user.id } });
              } else {
                navigate('/dashboard');
              }
            },
          },
        );
      } else {
        verifyOtp(
          { email, otp: otpCode },
          {
            onSuccess: () => {
              navigate('/auth/login');
            },
          },
        );
      }
    }
  };

  return (
    <div>
      <AuthFormWrapper
        title="Login to your account"
        subtitle={`Enter your verification code sent to you at ${email || 'your email'}`}
        onSubmit={handleSubmit}
      >
        <div className={styles.otpSection}>
          <label className={elementsStyles.label}>
            Enter OTP here<span className={elementsStyles.required}>*</span>
          </label>

          <div className={styles.otpInputContainer} onPaste={handlePaste}>
            {otp.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={styles.otpInput}
                    // placeholder="0"
                  />
                  {index === 2 && <span className={styles.separator}>-</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          {(apiError || resendError) && (
            <span
              className={elementsStyles.error}
              style={{ display: 'block', marginBottom: '16px' }}
            >
              {(apiError as Error)?.message ||
                (resendError as Error)?.message ||
                'OTP operation failed.'}
            </span>
          )}
          <Button type="submit" variant="primary" disabled={otp.join('').length !== 6 || isPending}>
            {isPending ? 'Verifying...' : 'Continue'}
          </Button>
        </div>

        <div className={styles.resendAction}>
          {timeLeft > 0 ? (
            <p className={styles.timerText}>
              Resend code in 10:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className={styles.resendButton}
            >
              {isResending ? 'Resending...' : 'Resend code'}
            </button>
          )}
        </div>
      </AuthFormWrapper>
    </div>
  );
};
