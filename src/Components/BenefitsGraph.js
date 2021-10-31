import React, { useState, useEffect } from 'react'
import { getBenefitsByMaxAge, getMaxBenefits } from '../helpers/benefitsGetter'
import { allBenefitsByYears, allDelayedBenefitsByYears } from '../data/allBenefitsByYears'
import RangeSlider from './RangeSlider/RangeSlider'
import * as d3 from 'd3'
import '../App.css'


const TestGraph2 = () => {
  const startAge = 747
  const startAge2 = 747 + 24
  const maxAge = 85
  const benefitsTable = getBenefitsByMaxAge(allBenefitsByYears[0].data, startAge, maxAge)
  const wageEarner = [...benefitsTable.wageEarner]
  const benefitsTable2 = getBenefitsByMaxAge(allBenefitsByYears[0].data, startAge2, maxAge)
  const wageEarner2 = [0, 0, ...benefitsTable2.wageEarner]
  const monthlyData = Array.apply(null, Array(wageEarner.length)).map((_, i) => ({ earnings: wageEarner[i], year: i }))
  const monthlyData2 = Array.apply(null, Array(wageEarner2.length)).map((_, i) => ({ earnings: wageEarner2[i], year: i }))
  const height = 600
  const width = 700
  const margin = 60
  const xOffset = width / (wageEarner.length + 1)
  const yScale = d3.scaleLinear()
    .domain([0, wageEarner[wageEarner.length - 1]])
    .range([height, 0])
  const xScale = d3.scaleLinear()
    .domain([0, wageEarner.length + 1])
    .range([0, width])

  function showLine(y) {
    d3.select('svg').selectChild('line')
      .attr('x1', margin)
      .attr('y1', y ? y + 61 : 61)
      .attr('x2', 750)
      .attr('y2', y ? y + 61 : 61)
      .attr('stroke', 'orange')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', (3, 3))
  }

  function showInfo(x, y, d) {
    d3.select('span.age').remove()
    d3.select('span.earnings').remove()
    d3.select('.popupInfo')
      .append('span')
      .attr('class', 'age')
      .text(`Age: ${Math.floor(startAge / 12) + d.year}`)
      .style('font-size', '10px')
      .style('margin-left', '5px')
      .append('br')
    d3.select('.popupInfo')
      .append('span')
      .attr('class', 'earnings')
      .text(`Earnings: ${d.earnings}`)
      .style('font-size', '10px')
      .style('margin-left', '5px')
    d3.select('.popupInfo')
      .style('left', x + 'px')
      .style('top', y + 'px')
      .transition()
      .delay(50)
      .style('opacity', 1)
      .style('visibility', 'visible')
  }

  useEffect(() => {
    const container = d3.select('.container')
    const svg = d3.select('svg')
    const chart = svg.append('g')
      .attr('transform', `translate(${margin}, ${margin})`)

    svg.append('line')
    container
      .append('div')
      .attr('class', 'popupInfo')
      .style('position', 'absolute')
      .style('width', '90px')
      .style('height', '60px')
      .style('left', '0px')
      .style('top', '0px')
      .style('border', '1px solid black')
      .style('border-radius', '3px')
      .style('background', 'lightblue')
      .style('visibility', 'hidden')
      .style('opacity', 0)

    chart.append('g')
      .call(d3.axisLeft(yScale))
      .attr('stroke', 'lightgreen')

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(wageEarner.length, "f"))

    chart.append('g')
      .attr('class', 'grid')
      .call(() => d3.axisLeft().scale(yScale)
        .tickSize(-width, 0, 0)
        .tickFormat('')
      )

    // First bar chart
    chart.selectAll()
      .data(monthlyData)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', (d, i) => `translate(${xOffset * i + 20}, ${yScale(d.earnings)})`)

    // Second bar chart
    chart.selectAll()
      .data(monthlyData2)
      .enter()
      .append('g')
      .attr('class', 'bar2')
      .attr('transform', (d, i) => `translate(${xOffset * i + 30}, ${yScale(d.earnings)})`)

    d3.selectAll('g.bar')
      .append('rect')
      .attr('height', (d, i) => height - yScale(d.earnings))
      .attr('width', 10)
      .attr('fill', '#06a9fb')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .ease(d3.easeLinear)
          .delay(100)
          .attr('width', 20)
          .attr('x', -9)
          .style('opacity', .5)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .ease(d3.easeLinear)
          .delay(50)
          .attr('width', 10)
          .attr('x', 0)
          .style('opacity', 1)
      })

    d3.selectAll('g.bar2')
      .append('rect')
      .attr('height', (d, i) => height - yScale(d.earnings))
      .attr('width', 10)
      .attr('fill', 'black')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .ease(d3.easeLinear)
          .delay(100)
          .attr('width', 19)
          // .attr('x', 5)
          .style('opacity', .5)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .ease(d3.easeLinear)
          .delay(50)
          .attr('width', 10)
          .attr('x', 0)
          .style('opacity', 1)
      })

    d3.selectAll('g.bar')
      .on('mouseover', function (e, d) {
        const thisY = parseInt(d3.select(this).attr('transform').match(/\d+\.?\d+/g)[1])
        const barInfo = {
          earnings: d.earnings,
          year: d.year
        }
        showInfo(e.clientX + 3, e.clientY - 60, d)
        d3.select(this).selectChild('text')
          .style('visibility', 'visible')
        showLine(thisY)
      })
      .on('mousemove', function (e, d) {
        d3.select('.popupInfo')
          .style('left', e.clientX + 3 + 'px')
          .style('top', e.clientY - 60 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).selectChild('text')
          .style('visibility', 'hidden')
        d3.select('svg').selectChild('line')
          .attr('stroke-width', 0)
        d3.select('.popupInfo')
          .transition()
          // .delay(50)
          .style('opacity', 0)
          .style('visibility', 'hidden')
      })

    d3.selectAll('g.bar2')
      .on('mouseover', function (e, d) {
        const thisY = parseInt(d3.select(this).attr('transform').match(/\d+\.?\d+/g)[1])
        const barInfo = {
          earnings: d.earnings,
          year: d.year
        }
        showInfo(e.clientX + 3, e.clientY - 60, d)
        d3.select(this).selectChild('text')
          .style('visibility', 'visible')
        showLine(thisY)
      })
      .on('mousemove', function (e, d) {
        d3.select('.popupInfo')
          .style('left', e.clientX + 3 + 'px')
          .style('top', e.clientY - 60 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).selectChild('text')
          .style('visibility', 'hidden')
        d3.select('svg').selectChild('line')
          .attr('stroke-width', 0)
        d3.select('.popupInfo')
          .transition()
          // .delay(50)
          .style('opacity', 0)
          .style('visibility', 'hidden')
      })

    svg.append('text')
      .text(`Total benefits by year from age ${benefitsTable.ageYearsMonths} to ${maxAge}`)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'serif')
      .attr('text-decoration', 'underline')
      .attr('x', width / 2 + 30)
      .attr('y', 55)

  }, [])

  return <div class="container"><svg width="750" height="700" /></div>
}

const LineGraph = () => {
  const [age, setAge] = useState(0)
  const marginLeft = 80
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
      amount: 1000 * allApplicableAges[i].benefitPercent / 100
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

  function getActivePoint(id, line, coordinate) {
    d3.selectAll(id)
      .each(function (y) {
        if (d3.select(this).style('opacity') === 1) {
          const y = d3.select(this).attr('transform').match(/\d+\.?\d+/g)[1]
          d3.select(line)

        }
      })

  }

  function getSelectedAgeTick(d) {
    d3.select('.selectedAge').remove()
    d3.select('.chart')
      .append('text')
      .attr('class', 'selectedAge')
      .attr('transform', `translate(${getXPos(d)}, ${height + marginTop})`)
      .attr('font-size', '11.5')
      .attr('dy', '16')
      .text(d.yearsMonths)
  }


  useEffect(() => {
    const svg = d3.select('svg')
    const chart = svg.append('g')
      .attr('class', 'chart')
    // const falseYAxis = chart.append('g')
    //   .append('line')
    //   .attr('class', 'falseYAxis')
    //   .attr('x1', marginLeft)
    //   .attr('y1', marginTop + 160)
    //   .attr('x2', marginLeft)
    //   .attr('y2', marginTop + height)
    //   .attr('stroke', 'black')
    //   .attr('stroke-width', 2)
    const falseXAxis = chart.append('g')
      .append('line')
      .attr('class', 'falseXAxis')
      .attr('x1', marginLeft)
      .attr('y1', marginTop + height)
      .attr('x2', marginLeft + width)
      .attr('y2', marginTop + height)
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
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
      .style('color', 'lightgrey')
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
    d3.select('.yScale path')
    // .attr('stroke-width', '2px')
    chart.append('g')
      .attr('class', 'xScale')
      .attr('transform', `translate(${marginLeft}, ${height + marginTop})`)
      .call(xAxis)

    chart.append('line')
      .attr('x1', xStartAge)
      .attr('y1', marginTop)
      .attr('x2', xStartAge)
      .attr('y2', marginTop + height)
      .attr('stroke', 'lightgrey')
    chart.append('line')
      .attr('x1', xFullAge)
      .attr('y1', marginTop)
      .attr('x2', xFullAge)
      .attr('y2', marginTop + height)
      .attr('stroke', 'lightgrey')
    chart.append('line')
      .attr('x1', xMaxAge)
      .attr('y1', marginTop)
      .attr('x2', xMaxAge)
      .attr('y2', marginTop + height)
      .attr('stroke', 'lightgrey')

    chart.append('line')
      .attr('class', 'line1')
    chart.append('line')
      .attr('class', 'line2')
    chart.append('line')
      .attr('class', 'line3')
    chart.append('line')
      .attr('class', 'line4')

    chart.append('text')
      .attr('class', 'startAge')
      .attr('transform', `translate(${xStartAge - 9}, ${height + marginTop})`)
      .attr('font-size', '15')
      .attr('dy', '16')
      .text("62")
    chart.append('text')
      .attr('class', 'fullAge')
      .attr('transform', `translate(${xFullAge - 9}, ${height + marginTop})`)
      .attr('font-size', '15')
      .attr('dy', '16')
      .text("67")
    chart.append('text')
      .attr('class', 'maxAge')
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
      .append('text')
      .text(d => d3.format("$,")(d.amount))
      .attr('font-size', '15')
      .attr('dx', 10)
      .attr('dy', -9)
  }, [])

  useEffect(() => {
    d3.selectAll('.point')
      .style('opacity', function (d) {
        return (
          d.yearsMonths === "62" ? 1 :
            d.yearsMonths === "67" ? 1 :
              parseInt(d.yearsMonths) === 70 ? 1 :
                d.yearsMonths === allApplicableAges[age].yearsMonths ? 1 : 0
        )
      })
      // .style('fill', d => {
      //   return d.yearsMonths === allApplicableAges[age].yearsMonths ? 'green' : 'lightgreen'
      // })
    d3.selectAll('#innerPoint')
      .style('fill', d => {
        return d.yearsMonths === allApplicableAges[age].yearsMonths ? '#ff3232' : '#ff9090'
      })
    d3.select('.line1')
      .attr('x1', () => d3.select('.point#startAge').attr('transform').match(/\d+\.?\d+/g)[0])
      .attr('y1', () => d3.select('.point#startAge').attr('transform').match(/\d+\.?\d+/g)[1])
      .attr('x2', () => {
        let x
        d3.selectAll('.point#belowFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              x = point.attr('transform').match(/\d+\.?\d+/g)[0]
            }
          })
          return x ? x : d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[0]
      })
      .attr('y2', () => {
        let y
        d3.selectAll('.point#belowFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              y = point.attr('transform').match(/\d+\.?\d+/g)[1]
            }
          })
          return y ? y : d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[1]
      })
    d3.select('.line2')
      .attr('x1', () => d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[0])
      .attr('y1', () => d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[1])
      .attr('x2', () => {
        let x
        d3.selectAll('.point#belowFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              x = point.attr('transform').match(/\d+\.?\d+/g)[0]
            }
          })
          return x ? x : d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[0]
      })
      .attr('y2', () => {
        let y
        d3.selectAll('.point#belowFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              y = point.attr('transform').match(/\d+\.?\d+/g)[1]
            }
          })
          return y ? y : d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[1]
      })
    d3.select('.line3')
      .attr('x1', () => d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[0])
      .attr('y1', () => d3.select('.point#fullAge').attr('transform').match(/\d+\.?\d+/g)[1])
      .attr('x2', () => {
        let x
        d3.selectAll('.point#aboveFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              x = point.attr('transform').match(/\d+\.?\d+/g)[0]
            }
          })
          return x ? x : d3.select('.point#maxAge').attr('transform').match(/\d+\.?\d+/g)[0]
      })
      .attr('y2', () => {
        let y
        d3.selectAll('.point#aboveFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              y = point.attr('transform').match(/\d+\.?\d+/g)[1]
            }
          })
          return y ? y : d3.select('.point#maxAge').attr('transform').match(/\d+\.?\d+/g)[1]
      })
    d3.select('.line4')
      .attr('x1', () => d3.select('.point#maxAge').attr('transform').match(/\d+\.?\d+/g)[0])
      .attr('y1', () => d3.select('.point#maxAge').attr('transform').match(/\d+\.?\d+/g)[1])
      .attr('x2', () => {
        let x
        d3.selectAll('.point#aboveFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              x = point.attr('transform').match(/\d+\.?\d+/g)[0]
            }
          })
          return x ? x : d3.select('.point#maxAge').attr('transform').match(/\d+\.?\d+/g)[0]
      })
      .attr('y2', () => {
        let y
        d3.selectAll('.point#aboveFullAge')
          .each(function () {
            let point = d3.select(this)
            if (point.style('opacity') === '1') {
              y = point.attr('transform').match(/\d+\.?\d+/g)[1]
            }
          })
          return y ? y : d3.select('.point#maxAge').attr('transform').match(/\d+\.?\d+/g)[1]
      })
    // console.log(d3.selectAll('.point'))
  }, [age])

  return (
    <div
      id="container"
    >
      <svg
        width={width + 50}
        height={height + 80}
      />
      <RangeSlider
        setParentValue={setAge}
        range={allApplicableAges.length - 1}
        visibleRange={{ min: 62, max: 70 }}
      />
    </div>
  )
}

const OptimalAgeGraph = () => {
  const [birthYear, setBirthYear] = useState(1960)
  const [maxAge, setMaxAge] = useState(0)
  const [monthlyAmount, setMonthlyAmount] = useState(1000)
  const marginLeft = 50
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
    const yAxis = d3.axisLeft()
      .scale(yScale)

    chart.append('text')
      .text(`Max age ${parseInt(maxAge) + 70}`)
      .attr('y', marginTop - 10)
      .attr('x', marginLeft + width/2)
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
      .attr("cx",  d => xScale(d.age))
      .attr("cy",  d => yScale(d.earnings))
      .attr("r", 2)
      .attr("transform", `translate(${marginLeft + 6}, ${marginTop})`)
      .style("fill", "#CC0000");
    const line = d3.line()
      .x(d => xScale(d.age))
      .y(d => yScale(d.earnings))
      .curve(d3.curveMonotoneX)
    chart.append('path')
      .datum(maxAgeEarnings)
      .attr('class', 'line')
      .attr('transform', `translate(${marginLeft + 6}, ${marginTop})`)
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', 'lightblue')
      .style('stroke-width', 1)
  }, [maxAge])

  return (
    <>
    <div>
      <svg
        className="beforeFullAge"
        height={height}
        width={width + marginLeft + 50}
      />
      <RangeSlider
        setParentValue={setMaxAge}
        range={50}
        visibleRange={{ min: 70, max: 120 }}
      />
    </div>
    </>
  )
}

const DelayedOptimalAgeGraph = () => {
  const [birthYear, setBirthYear] = useState(1960)
  const [maxAge, setMaxAge] = useState(0)
  const [monthlyAmount, setMonthlyAmount] = useState(1000)
  const marginLeft = 50
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
    const yAxis = d3.axisLeft()
      .scale(yScale)
    
    svg.append('text')
      .text(`Max age ${parseInt(maxAge) + 70}`)
      .attr('y', marginTop - 10)
      .attr('x', marginLeft + width/2)
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
      .attr("cx",  d => xScale(d.age))
      .attr("cy",  d => yScale(d.earnings))
      .attr("r", 2)
      .attr("transform", `translate(${marginLeft + 11}, ${marginTop})`)
      .style("fill", "#CC0000");
    const line = d3.line()
      .x(d => xScale(d.age))
      .y(d => yScale(d.earnings))
      .curve(d3.curveMonotoneX)
    chart.append('path')
      .datum(delayedMaxAgeEarnings)
      .attr('class', 'line')
      .attr('transform', `translate(${marginLeft + 11}, ${marginTop})`)
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', 'lightblue')
      .style('stroke-width', 1)
  }, [maxAge])

  return (
    <>
    <div>
      <svg
        className="afterFullAge"
        height={height}
        width={width + marginLeft + 50}
      />
      <RangeSlider
        setParentValue={setMaxAge}
        range={50}
        visibleRange={{ min: 70, max: 120 }}
      />
    </div>
    </>
  )
}

const BenefitsGraph = () => {
  return (
    <div>
      {/* <TestGraph2 /> */}
      {/* <LineGraph /> */}
      <OptimalAgeGraph />
      <DelayedOptimalAgeGraph />
    </div>
  )
}

export default BenefitsGraph