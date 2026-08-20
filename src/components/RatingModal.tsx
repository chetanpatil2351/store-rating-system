import React, { useState, useEffect } from 'react';
import { Store, StoreRating } from '../types';
import { Star, CheckCircle } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  currentRating?: StoreRating;
  onSubmitRating: (storeId: string, ratingValue: number) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  store,
  currentRating,
  onSubmitRating,
}) => {
  // New rating starts with no selection.
  // Existing rating keeps its current score.
  const [selectedScore, setSelectedScore] = useState<number>(0);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [statusNote, setStatusNote] = useState<string>('');

  useEffect(() => {
    if (currentRating) {
      setSelectedScore(currentRating.rating);
    } else {
      setSelectedScore(0);
    }

    setHoverScore(0);
    setStatusNote('');
  }, [currentRating, isOpen, store]);

  if (!isOpen || !store) return null;

  const isModifying = !!currentRating;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !Number.isInteger(selectedScore) ||
      selectedScore < 1 ||
      selectedScore > 5
    ) {
      setStatusNote('Please select a rating from 1 to 5 stars!');
      return;
    }

    onSubmitRating(store.id, selectedScore);

    setStatusNote(
      isModifying
        ? 'Rating updated successfully!'
        : 'Rating submitted successfully!'
    );

    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div
          className="modal-content"
          style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
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
              style={{ color: '#ffffff', opacity: 0.8 }}
            >
              &times;
            </button>

            <h4
              className="modal-title"
              style={{ fontWeight: 'bold', fontSize: '14px' }}
            >
              <Star
                style={{
                  width: '16px',
                  height: '16px',
                  display: 'inline',
                  marginRight: '6px',
                  color: '#f0ad4e',
                }}
              />
              {isModifying
                ? 'Modify Submitted Rating'
                : 'Submit Store Rating'}
            </h4>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div
                className="well well-sm"
                style={{
                  backgroundColor: '#f9f9f9',
                  marginBottom: '15px',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#333',
                  }}
                >
                  {store.name}
                </div>

                <div
                  className="text-muted"
                  style={{ fontSize: '12px' }}
                >
                  {store.address}
                </div>

                <div
                  className="text-muted"
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                >
                  {store.email}
                </div>
              </div>

              {statusNote && (
                <div
                  className={
                    statusNote.includes('successfully')
                      ? 'alert alert-success'
                      : 'alert alert-danger'
                  }
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
                  {statusNote}
                </div>
              )}

              {/* Star Picker */}
              <div
                className="form-group text-center"
                style={{ marginBottom: 0 }}
              >
                <label
                  className="control-label"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '12px',
                  }}
                >
                  Select Rating Score (1 to 5 Stars){' '}
                  <span className="text-danger">*</span>
                </label>

                <div
                  className="well well-sm"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#fcf8e3',
                    border: '1px solid #faebcc',
                    padding: '10px 20px',
                    margin: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const active =
                        (hoverScore || selectedScore) >= starVal;

                      return (
                        <button
                          type="button"
                          key={starVal}
                          onClick={() => setSelectedScore(starVal)}
                          onMouseEnter={() => setHoverScore(starVal)}
                          onMouseLeave={() => setHoverScore(0)}
                          className={`star-btn ${
                            active ? 'active' : ''
                          }`}
                          title={`Rate ${starVal} Star${
                            starVal > 1 ? 's' : ''
                          }`}
                        >
                          ★
                        </button>
                      );
                    })}

                    <div
                      style={{
                        marginLeft: '12px',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        color: '#8a6d3b',
                      }}
                    >
                      {selectedScore > 0 ? selectedScore : '—'}{' '}
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#777',
                          fontWeight: 'normal',
                        }}
                      >
                        / 5.0
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                className="text-muted"
                style={{ fontSize: '11px' }}
              >
                {isModifying
                  ? 'Updating existing rating'
                  : 'New rating submission (1-5)'}
              </span>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-default btn-sm"
                  style={{ marginRight: '6px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-success btn-sm"
                  style={{ fontWeight: 'bold' }}
                >
                  {isModifying ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};