import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Pencil, Plus, Settings2, Trash2, Zap } from 'lucide-react';

import {
  Button,
  ListControls,
  NoDataFound,
  PageHeader,
  WarningModal,
} from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { usePlansList, useDeletePlan } from '../../features/platform/plans/hooks';
import { useEnterprisesList } from '../../features/platform/enterprises/hooks';
import { PlanFormModal } from '../../features/platform/plans/PlanFormModal';
import { StatusBadge } from '../../components/common';

import styles from './PlatformPlansPage.module.scss';

import type { Plan } from '../../features/platform/plans/types';

const TIER_LABELS: Record<number, string> = {
  0: 'Free',
  1: 'Standard',
  2: 'Premium',
};

const TIER_COLORS: Record<number, string> = {
  0: 'var(--color-gray-500)',
  1: 'var(--color-primary)',
  2: '#f59e0b',
};

const PlatformPlansPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = usePlansList(enterpriseFilter || undefined);
  const { data: entResponse } = useEnterprisesList();
  const { mutate: remove } = useDeletePlan();

  const allPlans = useMemo(() => response?.data ?? [], [response]);
  const enterprises = useMemo(() => entResponse?.data ?? [], [entResponse]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allPlans;
    return allPlans.filter((plan) => plan.name.toLowerCase().includes(q));
  }, [allPlans, debouncedSearch]);

  const handleAdd = useCallback(() => {
    setEditingPlan(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((plan: Plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingPlan(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, remove]);

  const showEmptyState = !isLoading && allPlans.length === 0 && !debouncedSearch;

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      {showEmptyState ? (
        <NoDataFound
          title="No Plans Yet"
          description="Create pricing plans that customers can subscribe to. Plans show on your website automatically."
          noDataImage={undefined}
          noDataImageAlt="No Plans"
          buttonText="Create Plan"
          onButtonClick={handleAdd}
          showButtonIcon
        />
      ) : (
        <>
          <PageHeader
            title="Plans"
            subtitle="Manage pricing plans. Created plans are visible on the website."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add plan
              </Button>
            }
          />

          <ListControls
            searchPlaceholder="Search plans..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={true}
            filterTitle="Enterprise"
            filterOptions={[
              { label: 'All Enterprises', value: '' },
              ...enterprises.map((e) => ({ label: e.name, value: e.id })),
            ]}
            selectedFilter={enterpriseFilter}
            onFilterChange={setEnterpriseFilter}
            showSort={false}
            showViewSwitcher={false}
            showMultiSelect={false}
          />

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Plans Found"
              description="Try adjusting your search."
              noDataImage={undefined}
              noDataImageAlt="No Plans"
            />
          ) : (
            <div className={styles.grid}>
              {filtered.map((plan) => {
                const entName = plan.enterprise_id
                  ? (enterprises.find((e) => e.id === plan.enterprise_id)?.name ??
                    plan.enterprise_id)
                  : null;
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    enterpriseName={entName}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                    onConfigure={(p) => navigate(`/platform/plans/${p.id}/permissions`)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      <PlanFormModal
        open={formOpen}
        onClose={handleClose}
        plan={editingPlan}
        defaultEnterpriseId={enterpriseFilter || undefined}
      />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This plan will be permanently removed and will no longer appear on the website."
        actionLabel="Delete"
        onAction={handleDelete}
      />
    </div>
  );
};

interface PlanCardProps {
  plan: Plan;
  enterpriseName: string | null;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onConfigure: (plan: Plan) => void;
}

const PlanCard = ({ plan, enterpriseName, onEdit, onDelete, onConfigure }: PlanCardProps) => {
  const tierLabel = TIER_LABELS[plan.tier_rank] ?? `Tier ${plan.tier_rank}`;
  const tierColor = TIER_COLORS[plan.tier_rank] ?? 'var(--color-primary)';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTierBadge} style={{ color: tierColor, borderColor: tierColor }}>
          <Zap size={12} />
          {tierLabel}
        </div>
        <div className={styles.cardActions}>
          <button
            className={styles.iconBtn}
            onClick={() => onConfigure(plan)}
            aria-label="Configure permissions"
            title="Configure permissions"
          >
            <Settings2 size={15} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => onEdit(plan)}
            aria-label="Edit plan"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            onClick={() => onDelete(plan)}
            aria-label="Delete plan"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.planName}>{plan.name}</div>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            ₹{Number(plan.price).toLocaleString('en-IN')}
            <span className={styles.pricePer}>/emp/mo</span>
          </span>
          {Number(plan.price_per_employee_annual) > 0 && (
            <span className={styles.annualPrice}>
              ₹{Number(plan.price_per_employee_annual).toLocaleString('en-IN')}/emp/yr
            </span>
          )}
        </div>

        {(Number(plan.discount) > 0 || Number(plan.annual_discount_percent) > 0) && (
          <div className={styles.discountRow}>
            {Number(plan.discount) > 0 && (
              <span className={styles.discountBadge}>{plan.discount}% off</span>
            )}
            {Number(plan.annual_discount_percent) > 0 && (
              <span className={styles.discountBadge}>
                {plan.annual_discount_percent}% annual discount
              </span>
            )}
          </div>
        )}

        {plan.description && <p className={styles.description}>{plan.description}</p>}

        {plan.feature && plan.feature.length > 0 && (
          <ul className={styles.featureList}>
            {plan.feature.map((feature, index) => (
              <li key={index} className={styles.featureItem}>
                <Check size={14} className={styles.featureCheck} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.cardFooter}>
        <StatusBadge status={plan.status} />
        <span className={styles.billingCycle}>
          <CreditCard size={13} />
          {plan.billing_cycle_default}
        </span>
        {enterpriseName && <span className={styles.enterpriseTag}>{enterpriseName}</span>}
      </div>
    </div>
  );
};

export default PlatformPlansPage;
