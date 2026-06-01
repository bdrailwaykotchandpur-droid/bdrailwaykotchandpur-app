import { useState, useEffect } from 'react';

// Feature flags - LOCATION_UPDATES.enabled = TRUE so Location Submit shows
const FEATURE_FLAGS = {
  LOCATION_UPDATES: {
    enabled: true,  // TRUE - Location Submit button will appear in navigation
    reason: '',
  },
  CITY_SEARCH: {
    enabled: false,
    reason: 'সিটি সার্চ ফিচারটি শীঘ্রই আসছে।',
  },
  INTERMEDIATE_STATIONS: {
    enabled: false,
    reason: 'মধ্যবর্তী স্টেশন ফিচারটি শীঘ্রই আসছে।',
  },
  FAVICON_TRACKING: {
    enabled: false,
    reason: 'ট্রেন ট্র্যাকিং ফিচারটি শীঘ্রই আসছে।',
  },
};

const useFeatureFlag = (featureName) => {
  const [feature, setFeature] = useState({
    enabled: false,
    reason: '',
    isAvailable: false,
  });

  useEffect(() => {
    const flag = FEATURE_FLAGS[featureName];
    if (flag) {
      setFeature({
        enabled: flag.enabled,
        reason: flag.reason || '',
        isAvailable: flag.enabled === true,
      });
    } else {
      setFeature({
        enabled: false,
        reason: 'Feature not found',
        isAvailable: false,
      });
    }
  }, [featureName]);

  return feature;
};

const FeatureGate = ({ featureName, children, fallback = null }) => {
  const { enabled, reason } = useFeatureFlag(featureName);

  if (!enabled) {
    if (fallback) return fallback;
    return (
      <div className="feature-disabled-message">
        <p>{reason || 'এই ফিচারটি সাময়িকভাবে বন্ধ আছে।'}</p>
      </div>
    );
  }

  return children;
};

export { useFeatureFlag, FeatureGate, FEATURE_FLAGS };
