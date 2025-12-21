import { useTranslation } from 'react-i18next';
import { LocationResult } from '../types';

interface StatusBannersProps {
  location: LocationResult | null;
  error: string | null;
}

const StatusBanners = ({ location, error }: StatusBannersProps) => {
  const { t } = useTranslation();

  return (
    <>
      {error && <div className="banner error">{error}</div>}
      {location && !error && (
        <div className="banner success">
          {t('banner.success', {
            name: location.name,
            country: location.country ? `, ${location.country}` : '',
            timezone: location.timezone,
          })}
        </div>
      )}
    </>
  );
};

export default StatusBanners;
