import { useState, useEffect } from 'react';

const FEATURE_FLAGS = {
  LOCATION_UPDATES: {
    enabled: false,
    reason: 'লোকেশন আপডেট ফিচারটি সাময়িকভাবে বন্ধ রাখা হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।',
  },
  CITY_SEARCH: {
    enabled: true,
    reason: '',
  },
  INTERMEDIATE_STATIONS: {
    enabled: true,
    reason: '',
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
