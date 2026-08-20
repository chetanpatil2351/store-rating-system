import React from 'react';
import { User, Store, StoreRating } from '../types';
import { User as UserIcon, Store as StoreIcon, Star } from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  stores: Store[];
  ratings: StoreRating[];
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  stores,
  ratings,
}) => {
  if (!isOpen || !user) return null;

  // Find linked store if user is a store owner
  let linkedStore: Store | undefined;
  if (user.role === 'store_owner') {
    linkedStore = stores.find((s) => s.ownerId === user.id);
  }

  const linkedStoreRatings = linkedStore ? ratings.filter((r) => r.storeId === linkedStore.id) : [];
  const storeRatingStats = linkedStore
    ? {
        average:
          linkedStoreRatings.length > 0
            ? Number((linkedStoreRatings.reduce((acc, curr) => acc + curr.rating, 0) / linkedStoreRatings.length).toFixed(1))
            : 0,
        count: linkedStoreRatings.length,
      }
    : null;

  const userRatingsSubmitted = ratings.filter((r) => r.userId === user.id);

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom" style={{ maxWidth: '520px' }}>
        <div className="modal-content" style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <div className="modal-header bg-primary" style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', color: '#ffffff' }}>
            <button
              type="button"
              className="close"
              onClick={onClose}
              style={{ color: '#ffffff', opacity: 0.8 }}
            >
              &times;
            </button>
            <h4 className="modal-title" style={{ fontWeight: 'bold', fontSize: '14px' }}>
              <UserIcon style={{ width: '15px', height: '15px', display: 'inline', marginRight: '6px' }} />
              User Profile & Details Card
            </h4>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div>
                <h4 style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>{user.name}</h4>
                <span className="text-muted" style={{ fontSize: '11px', fontFamily: 'monospace' }}>ID: {user.id}</span>
              </div>
              <span
                className={`label ${
                  user.role === 'admin'
                    ? 'label-danger'
                    : user.role === 'store_owner'
                    ? 'label-warning'
                    : 'label-info'
                }`}
                style={{ textTransform: 'uppercase', fontSize: '11px', padding: '4px 8px' }}
              >
                {user.role === 'admin' ? 'Administrator' : user.role === 'store_owner' ? 'Store Owner' : 'Normal User'}
              </span>
            </div>

            <table className="table table-bordered table-striped" style={{ fontSize: '12px', marginBottom: '15px' }}>
              <tbody>
                <tr>
                  <th style={{ width: '130px' }}>Email Address</th>
                  <td style={{ fontFamily: 'monospace' }}>{user.email}</td>
                </tr>
                <tr>
                  <th>Physical Address</th>
                  <td>{user.address}</td>
                </tr>
                <tr>
                  <th>Registered On</th>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Store Owner specific panel */}
            {user.role === 'store_owner' && (
              <div className="panel panel-warning" style={{ marginBottom: '15px' }}>
                <div className="panel-heading" style={{ padding: '6px 10px', fontSize: '12px', fontWeight: 'bold' }}>
                  <StoreIcon style={{ width: '13px', height: '13px', display: 'inline', marginRight: '4px' }} />
                  Store Owner Associated Business
                </div>
                <div className="panel-body" style={{ padding: '10px', fontSize: '12px' }}>
                  {linkedStore ? (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{linkedStore.name}</div>
                      <div className="text-muted" style={{ fontSize: '11px', marginBottom: '6px' }}>{linkedStore.address}</div>
                      <div className="well well-sm" style={{ backgroundColor: '#fff', margin: 0, padding: '6px 10px' }}>
                        <strong>Current Store Rating: </strong>
                        {storeRatingStats && storeRatingStats.count > 0 ? (
                          <span className="label label-warning" style={{ marginLeft: '4px' }}>
                            ★ {storeRatingStats.average} / 5 ({storeRatingStats.count} reviews)
                          </span>
                        ) : (
                          <span className="text-muted italic">No ratings yet</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted italic">No store currently linked to this owner account.</div>
                  )}
                </div>
              </div>
            )}

            {/* Normal User activity summary */}
            {user.role === 'user' && (
              <div className="panel panel-info" style={{ marginBottom: '15px' }}>
                <div className="panel-body" style={{ padding: '10px', fontSize: '12px' }}>
                  <Star style={{ width: '13px', height: '13px', display: 'inline', marginRight: '4px', color: '#f0ad4e' }} />
                  <strong>Total Ratings Submitted: </strong>
                  <span className="badge" style={{ backgroundColor: '#337ab7' }}>{userRatingsSubmitted.length}</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-default btn-sm"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
