"use client";

import { useState } from "react";
import { EQUB_PLANS, CUSTOM_PLAN_ID } from "@/lib/plans";
import { formatETB } from "@/lib/format";
import { createEqub } from "@/app/actions";
import {
  Calendar,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function NewEqubForm() {
  const [selectedPlanId, setSelectedPlanId] = useState(EQUB_PLANS[0].id);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(String(EQUB_PLANS[0].contributionAmount));
  const [frequency, setFrequency] = useState(EQUB_PLANS[0].frequency);
  const [maxMembers, setMaxMembers] = useState(String(EQUB_PLANS[0].maxMembers));
  const [drawMethod, setDrawMethod] = useState("lottery");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handlePlanSelect = (plan) => {
    setSelectedPlanId(plan.id);
    setAmount(String(plan.contributionAmount));
    setFrequency(plan.frequency);
    setMaxMembers(String(plan.maxMembers));
  };

  const handleCustomSelect = () => {
    setSelectedPlanId(CUSTOM_PLAN_ID);
    setAmount("1000");
    setFrequency("monthly");
    setMaxMembers("30");
  };

  const currentPlan = EQUB_PLANS.find((p) => p.id === selectedPlanId);
  const effectiveRound =
    currentPlan?.effectiveRoundAmount || Number(amount || 0);
  const calculatedPool = effectiveRound * Number(maxMembers || 0);

  return (
    <div className="new-equb-container">
      {/* Step 1: Choose an Equb Plan */}
      <div className="form-section-header">
        <span className="section-step-badge">Step 1</span>
        <div>
          <h2 className="section-step-title">Select an Equb Savings Plan</h2>
          <p className="section-step-desc">
            Choose from six standardized Ethiopian community plans or create a custom structure.
          </p>
        </div>
      </div>

      <div className="plan-selection-grid">
        {EQUB_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={`plan-card-option ${isSelected ? "selected" : ""}`}
              onClick={() => handlePlanSelect(plan)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handlePlanSelect(plan);
              }}
            >
              <div className="plan-card-header">
                <span className="plan-tier-label">{plan.tier}</span>
                {isSelected ? (
                  <CheckCircle2 size={18} className="plan-check-icon active" />
                ) : (
                  <span className="plan-check-placeholder" />
                )}
              </div>

              <h3 className="plan-card-name">{plan.name}</h3>
              <p className="plan-card-desc">{plan.description}</p>

              <div className="plan-card-specs">
                <div className="spec-row">
                  <span className="spec-label">Contribution:</span>
                  <span className="spec-value highlight">{formatETB(plan.contributionAmount)}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Frequency:</span>
                  <span className="spec-value">{plan.lotteryFrequency}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Max Members:</span>
                  <span className="spec-value">{plan.maxMembers} people</span>
                </div>
                <div className="spec-row target-pool-row">
                  <span className="spec-label">Target Round Pool:</span>
                  <span className="spec-value gold">{formatETB(plan.targetPool)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Plan Option */}
        <div
          className={`plan-card-option custom-option ${selectedPlanId === CUSTOM_PLAN_ID ? "selected" : ""}`}
          onClick={handleCustomSelect}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleCustomSelect();
          }}
        >
          <div className="plan-card-header">
            <span className="plan-tier-label">Tailored</span>
            {selectedPlanId === CUSTOM_PLAN_ID ? (
              <CheckCircle2 size={18} className="plan-check-icon active" />
            ) : (
              <span className="plan-check-placeholder" />
            )}
          </div>
          <h3 className="plan-card-name">Custom Equb Plan</h3>
          <p className="plan-card-desc">
            Define customized contribution amounts, member capacities, and draw frequencies.
          </p>
          <div className="plan-card-specs">
            <div className="spec-row">
              <span className="spec-label">Customizable:</span>
              <span className="spec-value">All Parameters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Configure & Finalize Details */}
      <div className="form-section-header" style={{ marginTop: "2rem" }}>
        <span className="section-step-badge">Step 2</span>
        <div>
          <h2 className="section-step-title">Equb Group Configuration</h2>
          <p className="section-step-desc">
            Provide a group name, verify the schedule, and set administrative rules.
          </p>
        </div>
      </div>

      <form
        action={async (formData) => {
          setIsSubmitting(true);
          setFormError("");
          try {
            await createEqub(null, formData);
          } catch (err) {
            // Next.js redirect throws a NEXT_REDIRECT error which is normal behavior
            if (err?.message?.includes("NEXT_REDIRECT")) throw err;
            setFormError(err?.message || "Failed to create Equb. Please check your inputs.");
            setIsSubmitting(false);
          }
        }}
        className="new-equb-form-card"
      >
        <input type="hidden" name="planId" value={selectedPlanId} />

        {formError && (
          <div className="error-banner" role="alert">
            {formError}
          </div>
        )}

        <div className="form-grid-two">
          <div className="field">
            <label htmlFor="equb-name">
              Equb Name <span className="req">*</span>
            </label>
            <input
              id="equb-name"
              name="name"
              type="text"
              required
              placeholder="e.g. Merkato Traders Circle, Bole Family Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <span className="hint">A recognizable title for all participating members.</span>
          </div>

          <div className="field">
            <label htmlFor="equb-start-date">
              First Round Due Date <span className="req">*</span>
            </label>
            <input
              id="equb-start-date"
              name="startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="hint">The scheduled date for the initial collection & lottery.</span>
          </div>
        </div>

        <div className="form-grid-three">
          <div className="field">
            <label htmlFor="equb-amount">Contribution Amount (ETB)</label>
            <input
              id="equb-amount"
              name="amount"
              type="number"
              min="50"
              max="5000000"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              readOnly={currentPlan && !currentPlan.isContributionConfigurable}
              className={currentPlan && !currentPlan.isContributionConfigurable ? "readonly-input" : ""}
            />
            <span className="hint">
              {currentPlan && !currentPlan.isContributionConfigurable
                ? "Locked by selected plan tier"
                : "Fixed amount per member"}
            </span>
          </div>

          <div className="field">
            <label htmlFor="equb-frequency">Frequency</label>
            {currentPlan ? (
              <>
                <input type="hidden" name="frequency" value={frequency} />
                <input
                  type="text"
                  readOnly
                  className="readonly-input"
                  value={
                    frequency === "daily"
                      ? "Daily"
                      : frequency === "weekly"
                      ? "Weekly"
                      : frequency === "biweekly"
                      ? "Biweekly (Every 2 weeks)"
                      : "Monthly"
                  }
                />
              </>
            ) : (
              <select
                id="equb-frequency"
                name="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly (Every 2 weeks)</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
            <span className="hint">Collection & draw interval</span>
          </div>

          <div className="field">
            <label htmlFor="equb-max-members">Membership Capacity</label>
            <input
              id="equb-max-members"
              name="maxMembers"
              type="number"
              min="2"
              max="500"
              required
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              readOnly={currentPlan && !currentPlan.isMembershipConfigurable}
              className={currentPlan && !currentPlan.isMembershipConfigurable ? "readonly-input" : ""}
            />
            <span className="hint">
              {currentPlan && !currentPlan.isMembershipConfigurable
                ? "Standard capacity for plan"
                : "Configurable member limit"}
            </span>
          </div>
        </div>

        <div className="form-grid-two">
          <div className="field">
            <label htmlFor="equb-draw-method">Winner Selection Method</label>
            <select
              id="equb-draw-method"
              name="drawMethod"
              value={drawMethod}
              onChange={(e) => setDrawMethod(e.target.value)}
            >
              <option value="lottery">Lottery Draw (Fair random selection on server)</option>
              <option value="order">Sequential Order (Agreed fixed member order)</option>
            </select>
            <span className="hint">Lottery draws randomly from eligible unpaid members.</span>
          </div>

          <div className="pool-summary-box">
            <span className="pool-summary-label">Target Round Pool</span>
            <span className="pool-summary-val">{formatETB(calculatedPool)}</span>
            <span className="pool-summary-sub">
              {maxMembers} members &times; {formatETB(effectiveRound)} per round
            </span>
          </div>
        </div>

        <div className="form-submit-row">
          <button type="submit" disabled={isSubmitting || !name} className="button create-equb-btn">
            {isSubmitting ? (
              <span>Creating Equb Group...</span>
            ) : (
              <>
                <span>Initialize Equb Group</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
