import React, { useState } from 'react';
import { validatePassword } from '../validation';
import { changePassword } from '../api';
import {
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged?: () => void;
  currentEmail: string;
}

export const ChangePasswordModal: React.FC<
  ChangePasswordModalProps
> = ({
  isOpen,
  onClose,
  onPasswordChanged,
  currentEmail,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const validationError =
      validatePassword(newPassword);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        'New password and Confirm password do not match!'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(newPassword);

      if (result.success) {
        onPasswordChanged?.();

        setSuccessMessage(
          'Password updated successfully!'
        );

        setTimeout(() => {
          setSuccessMessage('');
          setNewPassword('');
          setConfirmPassword('');
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update password';

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-custom">
      <div
        className="modal-dialog-custom"
        style={{ maxWidth: '450px' }}
      >
        <div
          className="modal-content"
          style={{
            boxShadow:
              '0 5px 15px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="modal-header bg-primary"
            style={{
              borderTopLeftRadius: '5px',
              borderTopRightRadius: '5px',
              color: '#ffffff',
            }}
          >
            <button
              type="button"
              className="close"
              onClick={onClose}
              style={{
                color: '#ffffff',
                opacity: 0.8,
              }}
            >
              &times;
            </button>

            <h4
              className="modal-title"
              style={{
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              <Lock
                style={{
                  width: '15px',
                  height: '15px',
                  display: 'inline',
                  marginRight: '6px',
                }}
              />
              Update Account Password
            </h4>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{ padding: '20px' }}
            >
              <div
                className="alert alert-info"
                style={{
                  padding: '8px 10px',
                  fontSize: '12px',
                  marginBottom: '15px',
                }}
              >
                <strong>Account:</strong> {currentEmail}
              </div>

              {errorMessage && (
                <div
                  className="alert alert-danger"
                  style={{
                    padding: '8px',
                    fontSize: '12px',
                  }}
                >
                  <AlertCircle
                    style={{
                      width: '14px',
                      height: '14px',
                      display: 'inline',
                      marginRight: '4px',
                    }}
                  />
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div
                  className="alert alert-success"
                  style={{
                    padding: '8px',
                    fontSize: '12px',
                  }}
                >
                  <CheckCircle
                    style={{
                      width: '14px',
                      height: '14px',
                      display: 'inline',
                      marginRight: '4px',
                    }}
                  />
                  {successMessage}
                </div>
              )}

              <div className="form-group">
                <label
                  className="control-label"
                  style={{ fontSize: '12px' }}
                >
                  New Password{' '}
                  <span className="text-danger">*</span>
                </label>

                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  className="form-control input-sm"
                />

                <span
                  className="help-block"
                  style={{
                    fontSize: '10px',
                    margin: '3px 0 0 0',
                  }}
                >
                  * Must be 8-16 characters with at least 1
                  uppercase letter and 1 special symbol
                  (e.g. @, #, $, !)
                </span>
              </div>

              <div className="form-group">
                <label
                  className="control-label"
                  style={{ fontSize: '12px' }}
                >
                  Confirm New Password{' '}
                  <span className="text-danger">*</span>
                </label>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Re-type new password..."
                  className="form-control input-sm"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-default btn-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-success btn-sm"
                style={{ fontWeight: 'bold' }}
              >
                {isLoading ? (
                  <Loader2
                    style={{
                      width: '14px',
                      height: '14px',
                      animation:
                        'spin 1s linear infinite',
                    }}
                  />
                ) : (
                  'Save New Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};