import React, { useState, useEffect } from 'react'
import { getBenefitsByMaxAge, getMaxBenefits } from '../helpers/benefitsGetter'
import { allBenefitsByYears, allDelayedBenefitsByYears } from '../data/allBenefitsByYears'
import RangeSlider from './RangeSlider/RangeSlider'
import * as d3 from 'd3'
import '../App.css'

const marginLeft = 70

export const LineGraph = () => {
  const [age, setAge] = useState(0)
  const [monthlyWage, setMonthlyWage] = useState(1000)
  const marginTop = 40
  const width = 800
  const height = 250
  const xFullAge = (width / 2) + marginLeft
  const xBelowFullAge = xFullAge - 100
  const xStartAge = xBelowFullAge - 100
  const xAboveFullAge = xFullAge + 100
  const xMaxAge = xAboveFullAge + 100
  const monthlyData = allBenefitsByYears[0].data
  const monthlyDataDelayed = allDelayedBenefitsByYears[0].data
  const applicableAges = Array.apply(null, Array(monthlyData.months.length)).map((_, i) =>
  ({
    yearsMonths: monthlyData.yearsMonths[i][0],
    months: monthlyData.months[i][0],
    benefitPercent: parseFloat(monthlyData.months[i][1]),
    spouseReductionPercent: parseFloat(monthlyData.months[i][2])
  }))
  const applicableDelayedAges = Array.apply(null, Array(monthlyDataDelayed.months.length)).map((_, i) =>
  ({
    yearsMonths: monthlyDataDelayed.yearsMonths[i][0],
    months: monthlyDataDelayed.months[i][0],
    benefitPercent: parseFloat(monthlyDataDelayed.months[i][1]),
  }))
  const allApplicableAges = applicableAges.concat(applicableDelayedAges)
  const monthlyBenefitAmounts = Array.apply(null, Array(allApplicableAges.length)).map((_, i) => (
    {
      yearsMonths: allApplicableAges[i].yearsMonths,
      months: allApplicableAges[i].months,
      // amount: (monthlyWage + 794 - (monthlyWage - 20 - 65)/2) * allApplicableAges[i].benefitPercent / 100
      amount: monthlyWage * allApplicableAges[i].benefitPercent / 100
    }
  ))
  const yScale = d3.scaleLinear()
    .domain([500, monthlyBenefitAmounts[monthlyBenefitAmounts.length - 1].amount])
    .range([height, 0])
  const xScaleMain = d3.scalePoint()
    // .domain([0, 62, 67, 70])
    .range([0, width])
  const xScaleSelectable = d3.scaleBand()
    .domain(monthlyBenefitAmounts.map(d => d.yearsMonths))
    .range([0, width])

  function getXPos(d) {
    return (
      parseInt(d.yearsMonths) < 67 ?
        d.yearsMonths === "62" ? xStartAge : xBelowFullAge :
        d.yearsMonths === "67" ? xFullAge :
          parseInt(d.yearsMonths) === 70 ? xMaxAge : xAboveFullAge
    )
  }

  function getPointIds(d) {
    return (
      parseInt(d.yearsMonths) < 67 ?
        d.yearsMonths === "62" ? "startAge" : "belowFullAge" :
        d.yearsMonths === "67" ? "fullAge" :
          parseInt(d.yearsMonths) === 70 ? "maxAge" : "aboveFullAge"
    )
  }

  function getSelectedAgeTick(d) {
    d3.select('.selectedAge').remove()
    d3.select('.chart')
      .append('text')
      .attr('class', 'selectedAge')
      .attr('transform', `translate(${getXPos(d)}, ${height + marginTop})`)
      .attr('font-size', '11.5')
      .attr('dy', '16')
      .attr('text-anchor', 'middle')
      .text(() => {
        return d.yearsMonths === "62" ? null :
          d.yearsMonths === "67" ? null :
            d.yearsMonths === "70 or later" ? null :
              d.yearsMonths
      })
  }

  function getLineCoordinates(selection, pointIdFrom, pointIdTo, defaultPoint) {
    d3.select(selection)
      .attr('x1', () => d3.select(pointIdFrom).attr('transform').match(/\d+\.?\d+/g)[0])
      .attr('y1', () => d3.select(pointIdFrom).attr('transform').match(/\d+\.?\d+/g)[1])
      .attr('x2', () => {
        let x
        d3.selectAll(pointIdTo)
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              x = point.attr('transform').match(/\d+\.?\d+/g)[0]
            }
          })
        return x ? x : d3.select(defaultPoint).attr('transform').match(/\d+\.?\d+/g)[0]
      })
      .attr('y2', () => {
        let y
        d3.selectAll(pointIdTo)
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              y = point.attr('transform').match(/\d+\.?\d+/g)[1]
            }
          })
        return y ? y : d3.select(defaultPoint).attr('transform').match(/\d+\.?\d+/g)[1]
      })
  }

  useEffect(() => {
    const svg = d3.select('svg')
    const chart = svg.append('g')
      .attr('class', 'chart')
    chart.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${marginLeft}, ${marginTop})`)
      .call(d3.axisLeft()
        .scale(yScale)
        .tickSize(-width, 0, 0)
        .tickSizeOuter(0)
        .tickFormat('')
        .tickValues([700, 900, 1100, 1300]))
    d3.select('.grid')
      // .style('color', 'lightgrey')
      .attr('stroke-width', 1)
    const yAxis = d3.axisLeft()
      .scale(yScale)
      .tickFormat(d3.format("$,"))
      .tickValues([700, 900, 1100, 1300])
      .tickSizeOuter(0)
    const xAxis = d3.axisBottom()
      .tickSizeOuter(0)
      .scale(xScaleMain)

    chart.append('g')
      .attr('class', 'yScale')
      .attr('transform', `translate(${marginLeft}, ${marginTop})`)
      .style('font-size', "13px")
      .call(yAxis)
    chart.append('g')
      .attr('class', 'xScale')
      .attr('transform', `translate(${marginLeft}, ${height + marginTop})`)
      .call(xAxis)

    chart.append('line')
      .attr("class", "grid")
      .attr('x1', xStartAge)
      .attr('y1', marginTop)
      .attr('x2', xStartAge)
      .attr('y2', marginTop + height)
    chart.append('line')
      .attr("class", "grid")
      .attr('x1', xFullAge)
      .attr('y1', marginTop)
      .attr('x2', xFullAge)
      .attr('y2', marginTop + height)
    chart.append('line')
      .attr("class", "grid")
      .attr('x1', xMaxAge)
      .attr('y1', marginTop)
      .attr('x2', xMaxAge)
      .attr('y2', marginTop + height)

    chart.append('line')
      .attr('class', 'line1')
    chart.append('line')
      .attr('class', 'line2')
    chart.append('line')
      .attr('class', 'line3')
    chart.append('line')
      .attr('class', 'line4')

    chart.append('text')
      .attr('class', 'xAxisAge')
      .attr('transform', `translate(${xStartAge - 9}, ${height + marginTop})`)
      .attr('font-size', '15')
      .attr('dy', '16')
      .text("62")
    chart.append('text')
      .attr('class', 'xAxisAge')
      .attr('transform', `translate(${xFullAge - 9}, ${height + marginTop})`)
      .attr('font-size', '15')
      .attr('dy', '16')
      .text("67")
    chart.append('text')
      .attr('class', 'xAxisAge')
      .attr('transform', `translate(${xMaxAge - 30}, ${height + marginTop})`)
      .attr('font-size', '15')
      .attr('dy', '16')
      .text("70 or later")
    svg.append('text')
      .attr('x', height / 2 + marginTop - 10)
      .attr('y', marginLeft + height - 125)
      .attr('transform-origin', `${marginLeft} ${marginTop + height}`)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('$/month')

    chart.selectAll()
      .data(monthlyBenefitAmounts)
      .enter()
      .append('g')
      .attr('class', 'point')
      .attr('transform', d => `translate(${getXPos(d)}, ${marginTop + yScale(d.amount)})`)
    chart.selectAll('.point')
      .append('circle')
      .attr('id', 'pointBorder')
      .attr('r', 11)
    chart.selectAll('.point')
      .append('circle')
      .attr('id', 'outerPoint')
      .attr('r', 10)
    chart.selectAll('.point')
      .append('circle')
      .attr('id', 'innerPoint')
      .attr('r', 6)
    chart.selectAll('.point')
      .attr('id', d => getPointIds(d))
    chart.selectAll('.point')
      .append('g')
      .append('text')
      .attr('class', 'pointText')
      .text(d => d3.format("$,")(d.amount))
      .attr('font-size', '15')
      .attr('text-anchor', 'middle')
      .attr('dy', -17)
  }, [])

  useEffect(() => {
    d3.selectAll('.point')
      .style('opacity', d => {
        return (
          d.yearsMonths === "62" ? 1 :
            d.yearsMonths === "67" ? 1 :
              parseInt(d.yearsMonths) === 70 ? 1 :
                d.yearsMonths === allApplicableAges[age].yearsMonths ? 1 : 0
        )
      })
      .each(d => {
        if (d.yearsMonths === allApplicableAges[age].yearsMonths) {
          getSelectedAgeTick(d)
        }
      })
    d3.selectAll('#innerPoint')
      .style('fill', d => {
        return d.yearsMonths === allApplicableAges[age].yearsMonths ? '#ff3232' : '#ff9090'
      })
    getLineCoordinates('.line1', '.point#startAge', '.point#belowFullAge', '.point#fullAge')
    getLineCoordinates('.line2', '.point#fullAge', '.point#belowFullAge', '.point#fullAge')
    getLineCoordinates('.line3', '.point#fullAge', '.point#aboveFullAge', '.point#maxAge')
    getLineCoordinates('.line4', '.point#maxAge', '.point#aboveFullAge', '.point#maxAge')
  }, [age])

  return (
    <>
      <svg
        width={width + marginLeft}
        height={height + 80}
        style={{paddingRight: "30px"}}
      />
      <RangeSlider
        className="RangeSlider"
        setParentValue={setAge}
        range={allApplicableAges.length - 1}
        visibleRange={{ min: 62, max: 70 }}
      />
    </>
  )
}

export const OptimalAgeGraph = () => {
  const [birthYear, setBirthYear] = useState(1960)
  const [maxAge, setMaxAge] = useState(0)
  const [monthlyWage, setMonthlyWage] = useState(1000)
  const marginTop = 50
  const height = 500
  const yHeight = height * .67
  const width = 800
  const maxAgeEarnings = React.useMemo(() => getMaxBenefits(birthYear, parseInt(maxAge) + 70), [birthYear, parseInt(maxAge + 70)])

  useEffect(() => {
    d3.selectAll(".beforeFullAge > *").remove()
    const xScale = d3.scaleBand()
      .domain(maxAgeEarnings.map(d => d.age))
      .range([0, width])
    const yScale = d3.scaleLinear()
      .domain([d3.min(maxAgeEarnings.map(d => d.earnings)), d3.max(maxAgeEarnings.map(d => d.earnings))])
      .range([yHeight, 0])
    const svg = d3.select('.beforeFullAge')
    const chart = svg.append('g')
      .attr('class', 'chart')
    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickSizeOuter(0)
    const yAxis = d3.axisLeft()
      .scale(yScale)
      .tickFormat(d3.format("$,"))
      .tickSizeOuter(0)

    chart.append('text')
      .attr('class', 'titleText')
      .text(`Max age ${parseInt(maxAge) + 70}`)
      .attr('y', marginTop - 10)
      .attr('x', marginLeft + width / 2)
      .attr('text-anchor', 'middle')

    chart.append('g')
      .attr('class', 'xScale')
      .attr('transform', `translate(${marginLeft}, ${marginTop + yHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
    chart.append('g')
      .attr('class', 'yScale')
      .attr('transform', `translate(${marginLeft}, ${marginTop})`)
      .call(yAxis)

    chart.append('g')
      .selectAll("dot")
      .data(maxAgeEarnings)
      .enter()
      .append("circle")
      .attr("class", "scatterDot")
      .attr("cx", d => xScale(d.age))
      .attr("cy", d => yScale(d.earnings))
      .attr("transform", `translate(${marginLeft + 6}, ${marginTop})`)
    const line = d3.line()
      .x(d => xScale(d.age))
      .y(d => yScale(d.earnings))
      .curve(d3.curveMonotoneX)
    chart.append('path')
      .datum(maxAgeEarnings)
      .attr('class', 'scatterLine')
      .attr('transform', `translate(${marginLeft + 6}, ${marginTop})`)
      .attr('d', line)
      .style('fill', 'none')
  }, [maxAge])

  return (
    <>
      <svg
        className="beforeFullAge"
        height={height}
        width={width + marginLeft + 30}
      />
      <RangeSlider
        className="RangeSlider"
        setParentValue={setMaxAge}
        range={50}
        visibleRange={{ min: 70, max: 120 }}
      />
    </>
  )
}

export const DelayedOptimalAgeGraph = () => {
  const [birthYear, setBirthYear] = useState(1960)
  const [maxAge, setMaxAge] = useState(0)
  const [monthlyAmount, setMonthlyAmount] = useState(1000)
  const marginTop = 50
  const height = 500
  const yHeight = height * .67
  const width = 800
  const delayedMaxAgeEarnings = React.useMemo(() => getMaxBenefits(birthYear, parseInt(maxAge) + 70, monthlyAmount, true), [birthYear, parseInt(maxAge) + 70])

  useEffect(() => {
    d3.selectAll(".afterFullAge > *").remove()
    const xScale = d3.scaleBand()
      .domain(delayedMaxAgeEarnings.map(d => d.age))
      .range([0, width])
    const yScale = d3.scaleLinear()
      .domain([d3.min(delayedMaxAgeEarnings.map(d => d.earnings)), d3.max(delayedMaxAgeEarnings.map(d => d.earnings))])
      .range([yHeight, 0])
    const svg = d3.select('.afterFullAge')
    const chart = svg.append('g')
      .attr('class', 'chart')
    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickSizeOuter(0)
    const yAxis = d3.axisLeft()
      .scale(yScale)
      .tickFormat(d3.format("$,"))
      .tickSizeOuter(0)

    svg.append('text')
      .attr("class", "titleText")
      .text(`Max age ${parseInt(maxAge) + 70}`)
      .attr('y', marginTop - 10)
      .attr('x', marginLeft + width / 2)
      .attr('text-anchor', 'middle')

    chart.append('g')
      .attr('class', 'xScale')
      .attr('transform', `translate(${marginLeft}, ${marginTop + yHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
    chart.append('g')
      .attr('class', 'yScale')
      .attr('transform', `translate(${marginLeft}, ${marginTop})`)
      .call(yAxis)

    chart.append('g')
      .selectAll("dot")
      .data(delayedMaxAgeEarnings)
      .enter()
      .append("circle")
      .attr("class", "scatterDot")
      .attr("cx", d => xScale(d.age))
      .attr("cy", d => yScale(d.earnings))
      .attr("transform", `translate(${marginLeft + 11}, ${marginTop})`)
    const line = d3.line()
      .x(d => xScale(d.age))
      .y(d => yScale(d.earnings))
      .curve(d3.curveMonotoneX)
    chart.append('path')
      .datum(delayedMaxAgeEarnings)
      .attr('class', 'scatterLine')
      .attr('transform', `translate(${marginLeft + 11}, ${marginTop})`)
      .attr('d', line)
      .style('fill', 'none')
  }, [maxAge])

  return (
    <div
      id="container"
    >
      <svg
        className="afterFullAge"
        height={height}
        width={width + marginLeft + 30}
      />
      <RangeSlider
        className="RangeSlider"
        setParentValue={setMaxAge}
        range={50}
        visibleRange={{ min: 70, max: 120 }}
      />
    </div>
  )
}