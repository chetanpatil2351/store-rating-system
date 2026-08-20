import React, { useState, useMemo } from 'react';
import { User, Store, StoreRating } from '../types';
import { RatingModal } from './RatingModal';
import {
  Store as StoreIcon,
  Search,
  Edit3,
  Plus,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  MapPin,
  Mail
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  stores: Store[];
  ratings: StoreRating[];
  onSubmitRating: (storeId: string, ratingValue: number) => Promise<void> | void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  stores,
  ratings,
  onSubmitRating,
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  // Rating Modal state
  const [activeStoreForRating, setActiveStoreForRating] = useState<Store | null>(null);
  const [activeUserRating, setActiveUserRating] = useState<StoreRating | undefined>(undefined);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'address' | 'overallRating' | 'myRating'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Alerts
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenRating = (store: Store, existingRating?: StoreRating) => {
    setActiveStoreForRating(store);
    setActiveUserRating(existingRating);
    setIsRatingModalOpen(true);
  };

  const handleSaveRatingFromModal = async (storeId: string, ratingVal: number) => {
    try {
      await onSubmitRating(storeId, ratingVal);
      setToastMessage('Rating submitted and persisted to backend database!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit rating');
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const toggleSort = (field: 'name' | 'address' | 'overallRating' | 'myRating') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const processedStores = useMemo(() => {
    return stores
      .filter((store) => {
        const matchesName = store.name.toLowerCase().includes(searchName.toLowerCase());
        const matchesAddress = store.address.toLowerCase().includes(searchAddress.toLowerCase());
        return matchesName && matchesAddress;
      })
      .map((store) => {
        const storeRatings = ratings.filter((r) => r.storeId === store.id);
        const count = storeRatings.length;
        const sum = storeRatings.reduce((acc, curr) => acc + curr.rating, 0);
        const overallAverage = count > 0 ? Number((sum / count).toFixed(1)) : 0;
        const myRatingObj = ratings.find((r) => r.storeId === store.id && r.userId === currentUser.id);
        return {
          ...store,
          overallAverage,
          totalRatingsCount: count,
          myRatingObj: myRatingObj,
          myScore: myRatingObj ? myRatingObj.rating : 0,
        };
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortField === 'address') cmp = a.address.localeCompare(b.address);
        else if (sortField === 'overallRating') cmp = a.overallAverage - b.overallAverage;
        else if (sortField === 'myRating') cmp = a.myScore - b.myScore;
        return sortAsc ? cmp : -cmp;
      });
  }, [stores, ratings, searchName, searchAddress, currentUser.id, sortField, sortAsc]);

  const myRatedCount = useMemo(() => {
    return ratings.filter((r) => r.userId === currentUser.id).length;
  }, [ratings, currentUser.id]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 15px', backgroundColor: '#f5f5f5' }}>
      <div className="container-fluid">
        {/* Welcome Jumbotron / Well */}
        <div className="well well-sm" style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              Welcome, {currentUser.name}
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>
              Browse registered stores, view overall ratings, and submit or modify your 1 to 5 star ratings.
            </p>
          </div>
          <div>
            <span className="label label-info" style={{ fontSize: '12px', padding: '6px 10px' }}>
              Your Rated Stores: <strong>{myRatedCount}</strong>
            </span>
          </div>
        </div>

        {toastMessage && (
          <div className="alert alert-success" style={{ padding: '10px', fontSize: '12px' }}>
            <CheckCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
            {toastMessage}
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger" style={{ padding: '10px', fontSize: '12px' }}>
            <AlertCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
            {errorMessage}
          </div>
        )}

        {/* Search Filter Well */}
        <div className="well well-sm" style={{ backgroundColor: '#ffffff', marginBottom: '15px' }}>
          <div className="row">
            <div className="col-sm-12" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#555' }}>
                <Search style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#337ab7' }} />
                Search:
              </span>

              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search by Store Name..."
                className="form-control input-sm"
                style={{ width: '220px', display: 'inline-block' }}
              />

              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Search by Address / City..."
                className="form-control input-sm"
                style={{ width: '220px', display: 'inline-block' }}
              />

              {(searchName || searchAddress) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchName('');
                    setSearchAddress('');
                  }}
                  className="btn btn-link btn-xs text-danger"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stores Directory Panel */}
        <div className="panel panel-default">
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
              <StoreIcon style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#337ab7' }} />
              Registered Stores Directory ({processedStores.length} Stores Available)
            </h3>
            <span className="text-muted" style={{ fontSize: '11px' }}>Click column headers to sort</span>
          </div>
          <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <table className="table table-striped table-bordered table-hover table-condensed" style={{ marginBottom: 0, fontSize: '12px' }}>
              <thead>
                <tr className="active">
                  <th style={{ width: '35px' }}>#</th>
                  <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                    Store Name <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                  <th onClick={() => toggleSort('address')} style={{ cursor: 'pointer' }}>
                    Physical Address <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                  <th onClick={() => toggleSort('overallRating')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Overall Rating <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                  <th onClick={() => toggleSort('myRating')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    My Rating <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                  </th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {processedStores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted" style={{ padding: '30px' }}>
                      No stores found matching your search query.
                    </td>
                  </tr>
                ) : (
                  processedStores.map((store, index) => {
                    const hasRated = !!store.myRatingObj;
                    return (
                      <tr key={store.id}>
                        <td className="text-muted">{index + 1}</td>
                        <td>
                          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{store.name}</div>
                          <div className="text-muted" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                            <Mail style={{ width: '11px', height: '11px', display: 'inline', marginRight: '2px' }} />
                            {store.email}
                          </div>
                        </td>
                        <td style={{ maxWidth: '240px' }}>
                          <MapPin style={{ width: '12px', height: '12px', display: 'inline', marginRight: '2px', color: '#888' }} />
                          {store.address}
                        </td>
                        <td className="text-center">
                          {store.totalRatingsCount > 0 ? (
                            <span className="label label-warning" style={{ fontSize: '11px' }}>
                              ★ {store.overallAverage} / 5 ({store.totalRatingsCount} ratings)
                            </span>
                          ) : (
                            <span className="text-muted italic" style={{ fontSize: '11px' }}>No ratings yet</span>
                          )}
                        </td>
                        <td className="text-center">
                          {hasRated ? (
                            <span className="label label-primary" style={{ fontSize: '11px' }}>
                              ★ {store.myRatingObj?.rating} / 5
                            </span>
                          ) : (
                            <span className="text-muted italic" style={{ fontSize: '11px' }}>Not Rated</span>
                          )}
                        </td>
                        <td className="text-center">
                          {hasRated ? (
                            <button
                              type="button"
                              onClick={() => handleOpenRating(store, store.myRatingObj)}
                              className="btn btn-primary btn-xs"
                              title="Modify your rating"
                            >
                              <Edit3 style={{ width: '11px', height: '11px', display: 'inline', marginRight: '3px' }} />
                              Modify
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenRating(store)}
                              className="btn btn-success btn-xs"
                              title="Submit a rating (1-5)"
                            >
                              <Plus style={{ width: '11px', height: '11px', display: 'inline', marginRight: '3px' }} />
                              Rate Store
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rating Submit/Modify Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        store={activeStoreForRating}
        currentRating={activeUserRating}
        onSubmitRating={handleSaveRatingFromModal}
      />
    </div>
  );
};
