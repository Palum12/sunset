import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface AppHeaderProps {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

const AppHeader = ({ query, loading, onQueryChange, onSubmit }: AppHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div>
        <p className="eyebrow">{t('hero.eyebrow')}</p>
        <h1>{t('hero.title')}</h1>
        <p className="lede">{t('hero.lede')}</p>
      </div>
      <div className="header-actions">
        <form className="search" onSubmit={onSubmit}>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.aria')}
          />
          <button type="submit" disabled={loading}>
            {loading ? t('search.loading') : t('search.cta')}
          </button>
        </form>
      </div>
    </header>
  );
};

export default AppHeader;
