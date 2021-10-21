import { useState, useEffect } from 'react';
import { getBenefitsByMaxAge } from './helpers/benefitsGetter'
import { allBenefitsByYears, allDelayedBenefitsByYears } from './data/allBenefitsByYears'
import './App.css';

const Benefits = ({ benefits, monthlyBenefit }) => {
  const benefitsTable = getBenefitsByMaxAge(benefits.data, 744, 85, monthlyBenefit)

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{benefits.year}</h2> From age {benefitsTable.ageYearsMonths} to 85, assuming ${monthlyBenefit}/mo
      <div className="benefits-container">
        <div className="benefits-item">
          <h4>Wage earner benefits</h4>
          {benefitsTable.wageEarner.map((amount, i) => {
            return <li>Year {i + 1}: {amount}</li>
          })}
        </div>
        <div className="benefits-item">
          <h4>Spouse benefits</h4>
          {benefitsTable.spouse.map((amount, i) => {
            return <li>Year {i + 1}: {amount}</li>
          })}
        </div>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <div className="App">
      {allBenefitsByYears.map(row => {
        return <Benefits benefits={row} monthlyBenefit={1000} />
      })}
    </div>
  );
}

export default App;