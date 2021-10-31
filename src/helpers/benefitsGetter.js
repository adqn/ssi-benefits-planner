import { allBenefitsByYears, allDelayedBenefitsByYears } from '../data/allBenefitsByYears'
// React doesn't like Coffeescript
// const urllib = require('urllib')

// const getBenefitsHtml = (year, delayed = false) => {
//   return new Promise((resolve, reject) => {
//     urllib.request(`https://www.ssa.gov/benefits/retirement/planner/${delayed ? year + "-delay" : year}.html`)
//       .then(result => (resolve(result.data.toString())))
//   })
// }

const getBenefitsTables = data => {
  const tableStart = data.search(/\<tbody\>/);
  const tableEnd = data.search(/\<td colspan/);
  const tableRows = data.slice(tableStart, tableEnd).split("<tr>").slice(1, -1).map(row => row.match(/(?<=\<td\>).+(?=\<\/td>)/g));
  const tableRowsByMonths = tableRows.map((row, i) => (
    row.length > 2 ?
      [row[0].search(/\+/) !== -1 ? (parseInt(row[0].split(" + ")[0]) * 12) + parseInt(row[0].split(" + ")[1])
        : parseInt(row[0]) * 12, row[1], row[2]]
      :
      [row[0].search(/\+/) !== -1 ? (parseInt(row[0].split(" + ")[0]) * 12) + parseInt(row[0].split(" + ")[1])
        : parseInt(row[0]) * 12, row[1]])
  )
  return { yearsMonths: tableRows, months: tableRowsByMonths }
}

// const getBenefitsTablesByYears = (delayed = false) => {
//   const applicableYears = [
//     '1943',
//     '1955',
//     '1956',
//     '1957',
//     '1958',
//     '1959',
//     '1960'
//   ]
//   const tablesByYears = {}

//   for (let year of applicableYears) {
//     setTimeout(() => {
//       getBenefitsHtml(year, delayed)
//         .then(res => console.log(JSON.stringify({ year: year, data: getBenefitsTables(res) })))
//     }, 2000)
//   }
// }

export const getBenefitsByMaxAge = (benefitsTables, startAge, maxAge, monthlyBenefit = 1000) => {
  let ageYearsMonths
  let reductionPercent
  let spouseReductionPercent
  let adjustedMonthlyBenefit
  let adjustedSpouseMonthlyBenefit
  let firstYearOffset
  let firstYearBenefits
  let firstYearSpouseBenefits
  let maxBenefitsByYears
  let maxSpouseBenefitsByYears

  for (let i = 0; i < benefitsTables.months.length; i++) {
    if (benefitsTables.months[i][0] === startAge) {
      reductionPercent = parseFloat(benefitsTables.months[i][1]) / 100
      spouseReductionPercent = parseFloat(benefitsTables.months[i][2]) / 100
      ageYearsMonths = benefitsTables.yearsMonths[i][0]
      firstYearOffset = ageYearsMonths.search(/\+/) !== -1 ? 12 - parseInt(ageYearsMonths.split(" + ")[1]) : 12
    }
  }

  firstYearBenefits = firstYearOffset * monthlyBenefit * reductionPercent
  firstYearSpouseBenefits = firstYearOffset * monthlyBenefit * spouseReductionPercent
  adjustedMonthlyBenefit = reductionPercent * monthlyBenefit
  adjustedSpouseMonthlyBenefit = spouseReductionPercent * monthlyBenefit
  maxBenefitsByYears = Array.apply(null, Array(maxAge - Math.floor(startAge / 12)))
  maxSpouseBenefitsByYears = Array.apply(null, Array(maxAge - Math.floor(startAge / 12)))

  for (let i = 0; i < maxBenefitsByYears.length; i++) {
    maxBenefitsByYears[i] = i * 12 * adjustedMonthlyBenefit + firstYearBenefits
    maxSpouseBenefitsByYears[i] = i * 12 * adjustedSpouseMonthlyBenefit + firstYearSpouseBenefits
  }

  return { ageYearsMonths, wageEarner: maxBenefitsByYears, spouse: maxSpouseBenefitsByYears }
}

const getBenefitsByYear = (allBenefitsByYears, birthYear) => {
  let year = birthYear >= 1943 && birthYear <= 1954 ? 1943
    : birthYear >= 1960 ? 1960
      : birthYear

  for (let i = 0; i < allBenefitsByYears.length; i++) {
    if (allBenefitsByYears[i].year === year.toString()) return allBenefitsByYears[i]
  }
}

const getBenefitReductions = benefitsTables => {
  const reductions = {}
  reductions.percentages = Array.apply(null, Array(benefitsTables.data.months.length)).map((_, i) =>
    parseFloat(benefitsTables.data.months[i][1]))
  reductions.applicableMonths = Array.apply(null, Array(benefitsTables.data.months.length)).map((_, i) =>
    benefitsTables.data.months[i][0])
  reductions.applicableYearsMonths = Array.apply(null, Array(benefitsTables.data.months.length)).map((_, i) =>
    benefitsTables.data.yearsMonths[i][0])
  return reductions
}

export const getMaxBenefits = (birthYear, maxAge, monthlyBenefit = 1000, delayed = false) => {
  const benefitsReductions = getBenefitReductions(getBenefitsByYear(delayed ? allDelayedBenefitsByYears : allBenefitsByYears, birthYear))
  const benefitsRange = delayed ? maxAge * 12  - 792 : maxAge * 12 - 744 // Expected lifespan over n months beginning at age 62
  const earningsByStartAge = []
  let reductionPercent
  let adjustedMonthlyBenefit
  let totalEarnings

  for (let i = 0; i < benefitsReductions.percentages.length; i++) {
    reductionPercent = benefitsReductions.percentages[i] / 100
    adjustedMonthlyBenefit = reductionPercent * monthlyBenefit
    totalEarnings = adjustedMonthlyBenefit * (benefitsRange - i)
    // earningsByStartAge[benefitsReductions.applicableYearsMonths[i]] = totalEarnings
    earningsByStartAge.push({
      age: benefitsReductions.applicableYearsMonths[i],
      earnings: totalEarnings
    })
  }

  return earningsByStartAge
}

// console.log(getBenefitReductionsByYear(allBenefitsByYears, 1965))
console.log(getMaxBenefits(1960, 78))
console.log(getMaxBenefits(1960, 90, 1000, true))

const someEarnings = {}
for (let i = 0; i <= 20; i++) {
  let maxBenefitsToAge = getMaxBenefits(1960, 78 + i)
  let ageYearsMonths = Object.keys(maxBenefitsToAge)
  let earningsByEndAge = Object.values(maxBenefitsToAge)
  let maxEarningsByEndAge = Math.max(...earningsByEndAge)
  someEarnings[70 + i] = maxEarningsByEndAge
}
