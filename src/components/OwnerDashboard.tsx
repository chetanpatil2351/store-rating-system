import React, { useState, useMemo } from 'react';
import { User, Store, StoreRating } from '../types';
import {
  Store as StoreIcon,
  Users,
  ArrowUpDown,
  MapPin,
  Mail,
  TrendingUp,
  Award
} from 'lucide-react';

interface OwnerDashboardProps {
  currentUser: User;
  stores: Store[];
  ratings: StoreRating[];
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  stores,
  ratings,
}) => {
  // Find linked store
  const linkedStore = useMemo(() => {
    return stores.find((s) => s.ownerId === currentUser.id);
  }, [stores, currentUser]);

  // Ratings for this store
  const storeReviews = useMemo(() => {
    if (!linkedStore) return [];
    return ratings.filter((r) => r.storeId === linkedStore.id);
  }, [ratings, linkedStore]);

  // Overall store statistics
  const storeStats = useMemo(() => {
    if (!linkedStore || storeReviews.length === 0) return { average: 0, count: 0 };
    const sum = storeReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Number((sum / storeReviews.length).toFixed(1));
    return { average: avg, count: storeReviews.length };
  }, [linkedStore, storeReviews]);

  // Star breakdown calculation
  const starBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    storeReviews.forEach((r) => {
      if (counts[r.rating as 1 | 2 | 3 | 4 | 5] !== undefined) {
        counts[r.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });
    return counts;
  }, [storeReviews]);

  // Search & Sorting for reviews
  const [searchUser, setSearchUser] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'rating' | 'date'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const toggleSort = (field: 'name' | 'email' | 'rating' | 'date') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'date' ? false : true);
    }
  };

  const processedReviews = useMemo(() => {
    return storeReviews
      .filter((r) => {
        const matchesName = r.userName.toLowerCase().includes(searchUser.toLowerCase());
        const matchesEmail = r.userEmail.toLowerCase().includes(searchUser.toLowerCase());
        return matchesName || matchesEmail;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          cmp = a.userName.localeCompare(b.userName);
        } else if (sortField === 'email') {
          cmp = a.userEmail.localeCompare(b.userEmail);
        } else if (sortField === 'rating') {
          cmp = a.rating - b.rating;
        } else if (sortField === 'date') {
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortAsc ? cmp : -cmp;
      });
  }, [storeReviews, searchUser, sortField, sortAsc]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 15px', backgroundColor: '#f5f5f5' }}>
      <div className="container-fluid">
        {/* Store Header Banner Well */}
        <div className="well" style={{ backgroundColor: '#ffffff', marginBottom: '15px' }}>
          {linkedStore ? (
            <div className="row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="col-sm-8">
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  <StoreIcon style={{ width: '18px', height: '18px', display: 'inline', marginRight: '6px', color: '#337ab7' }} />
                  {linkedStore.name}
                  <span className="label label-success" style={{ fontSize: '10px', marginLeft: '8px', verticalAlign: 'middle' }}>
                    VERIFIED STORE ENTITY
                  </span>
                </h3>
                <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>
                  <MapPin style={{ width: '12px', height: '12px', display: 'inline', marginRight: '3px' }} />
                  {linkedStore.address}
                  <span style={{ margin: '0 8px' }}>|</span>
                  <Mail style={{ width: '12px', height: '12px', display: 'inline', marginRight: '3px' }} />
                  <span style={{ fontFamily: 'monospace' }}>{linkedStore.email}</span>
                </p>
              </div>

              <div className="col-sm-4 text-right">
                <div className="well well-sm" style={{ display: 'inline-block', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', margin: 0, textAlign: 'center', padding: '8px 15px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8a6d3b', lineHeight: '1' }}>
                    ★ {storeStats.average} <span style={{ fontSize: '12px', color: '#777', fontWeight: 'normal' }}>/ 5.0</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '11px', marginTop: '3px' }}>
                    Based on <strong>{storeStats.count}</strong> customer review{storeStats.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning" style={{ margin: 0 }}>
              No store linked to this owner account yet. Please contact the System Administrator to assign a store.
            </div>
          )}
        </div>

        {/* Metrics Row using Bootstrap Panels */}
        <div className="row" style={{ marginBottom: '15px' }}>
          <div className="col-sm-4">
            <div className="panel panel-info text-center" style={{ marginBottom: '10px' }}>
              <div className="panel-heading" style={{ padding: '6px' }}>
                <h4 className="panel-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  <Award style={{ width: '13px', height: '13px', display: 'inline', marginRight: '3px' }} />
                  AVERAGE STORE RATING
                </h4>
              </div>
              <div className="panel-body" style={{ padding: '12px' }}>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#31708f' }}>{storeStats.average}</div>
                <div className="text-muted" style={{ fontSize: '10px' }}>Out of 5.0 Star Maximum</div>
              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="panel panel-primary text-center" style={{ marginBottom: '10px' }}>
              <div className="panel-heading" style={{ padding: '6px' }}>
                <h4 className="panel-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  <Users style={{ width: '13px', height: '13px', display: 'inline', marginRight: '3px' }} />
                  TOTAL CUSTOMER RATINGS
                </h4>
              </div>
              <div className="panel-body" style={{ padding: '12px' }}>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#337ab7' }}>{storeStats.count}</div>
                <div className="text-muted" style={{ fontSize: '10px' }}>Unique Verified Submissions</div>
              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="panel panel-success text-center" style={{ marginBottom: '10px' }}>
              <div className="panel-heading" style={{ padding: '6px' }}>
                <h4 className="panel-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  <TrendingUp style={{ width: '13px', height: '13px', display: 'inline', marginRight: '3px' }} />
                  POSITIVE SATISFACTION (4★ & 5★)
                </h4>
              </div>
              <div className="panel-body" style={{ padding: '12px' }}>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#3c763d' }}>
                  {storeStats.count > 0
                    ? `${Math.round(((starBreakdown[5] + starBreakdown[4]) / storeStats.count) * 100)}%`
                    : 'N/A'}
                </div>
                <div className="text-muted" style={{ fontSize: '10px' }}>4★ & 5★ Ratings Ratio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Ratings Listing Section */}
        <div className="panel panel-default">
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="panel-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
              <Users style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#337ab7' }} />
              List of Users Who Submitted Ratings for Your Store ({processedReviews.length})
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search reviewer name / email..."
                className="form-control input-sm"
                style={{ width: '220px', display: 'inline-block' }}
              />
              {searchUser && (
                <button
                  type="button"
                  onClick={() => setSearchUser('')}
                  className="btn btn-link btn-xs text-danger"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="table table-striped table-bordered table-hover table-condensed" style={{ marginBottom: 0, fontSize: '12px' }}>
              <thead>
                <tr className="active">
                  <th style={{ width: '35px' }}>#</th>
                  <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                    User Full Name <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                  <th onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>
                    User Email <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                  <th onClick={() => toggleSort('rating')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Rating Given <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                  <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                    Submitted On <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedReviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted" style={{ padding: '30px' }}>
                      No customer ratings found for your store yet.
                    </td>
                  </tr>
                ) : (
                  processedReviews.map((rev, index) => (
                    <tr key={rev.id}>
                      <td className="text-muted">{index + 1}</td>
                      <td><strong>{rev.userName}</strong></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{rev.userEmail}</td>
                      <td className="text-center">
                        <span className="label label-warning" style={{ fontSize: '11px' }}>
                          ★ {rev.rating} / 5
                        </span>
                      </td>
                      <td className="text-right text-muted" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
