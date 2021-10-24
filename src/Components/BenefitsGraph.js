import React, { setState, useEffect } from 'react'
import { getBenefitsByMaxAge } from '../helpers/benefitsGetter'
import { allBenefitsByYears, allDelayedBenefitsByYears } from '../data/allBenefitsByYears'
import * as d3 from 'd3'

const TestGraph = () => {
  const someData = [10, 2, 5, 13]
  const height = 400
  const width = 500

  useEffect(() => {
    const svg = d3.select('svg.testgraph')
    svg.append('line')
      .attr('x1', 100)
      .attr('y1', 100)
      .attr('x2', 100)
      .attr('y2', height)
      .attr('stroke', 'black')

    svg.append('line')
      .attr('x1', 100)
      .attr('y1', height)
      .attr('x2', width)
      .attr('y2', height)
      .attr('stroke', 'black')

    svg.selectAll('g')
      .data(someData)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${i*40 + 120}, ${height - d*10})`)

    svg.selectAll('g')
      .append('rect')
      .attr('height', d => d*10)
      .attr('width', 20)

    svg.selectAll('g')
      .append('text')
      .attr('y', d => d - 20)
      .style('visibility', 'hidden')
      .text(d => d)
      .attr('fill', 'red')
    
    svg.selectAll('g')
      .on('mouseover', function () {
        d3.select(this).selectChild('text')
          .style('visibility', 'visible')
      })
      .on('mouseout', function () {
        d3.select(this).selectChild('text')
          .style('visibility', 'hidden')
      })
  }, [])

  return (
    <svg
      class="testgraph"
      width="500"
      height="500"
    />
  )
}

const TestGraph2 = () => {
  const startAge = 747
  const maxAge = 85
  const benefitsTable = getBenefitsByMaxAge(allBenefitsByYears[0].data, startAge, maxAge)
  const wageEarner = [...benefitsTable.wageEarner]
  const data = Array.apply(null, Array(wageEarner.length)).map((_, i) => ({earnings: wageEarner[i], year: i}))
  console.log(data)
  const height = 600
  const width = 700
  const margin = 60
  const xOffset = width/(wageEarner.length + 1)
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
      .text(`Age: ${Math.floor(startAge/12) + d.year}`)
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
      // .data(data)
      // .enter()
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

    chart.selectAll()
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', (d, i) => `translate(${xOffset * i + 20}, ${yScale(d.earnings)})`)
      // .attr('x', (d, i) => xOffset * i + 20)
      // .attr('y', d => yScale(d))

    d3.selectAll('g.bar')
      .append('rect')
      .attr('height', (d, i) => height - yScale(d.earnings))
      .attr('width', 20)
      .attr('fill', '#06a9fb')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .ease(d3.easeLinear)
          .delay(100)
          .attr('width', 30)
          .attr('x', -5)
          .style('opacity', .5)
        })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .ease(d3.easeLinear)
          .delay(50)
          .attr('width', 20)
          .attr('x', 0)
          .style('opacity', 1)
      })

    // d3.selectAll('g.bar')
    //   .append('text')
    //   .attr('y', -5)
    //   .attr('x', 9)
    //   .text(d => parseInt(d.earnings))
    //   .style('font-size', '10px')
    //   .style('text-anchor', 'middle')
    //   .style('visibility', 'hidden')
    
    // d3.selectAll('g.bar')
    //   .data(data)
    //   .enter().append('rect')
    //   .attr('class', 'popupInfo')
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', 90)
    //   .attr('height', 60)
    //   .attr('fill', 'lightblue')
    //   .style('visibility', 'hidden')

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
      
    svg.append('text')    
      .text(`Total benefits by year from age ${benefitsTable.ageYearsMonths} to ${maxAge}`)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'serif')
      .attr('text-decoration', 'underline')
      .attr('x', width/2 + 30)
      .attr('y', 55)

  }, [])

  return <div class="container"><svg width="750" height="700" /></div>
}

const SVGTest = () => {
  function repeat() {
    d3.select('#circle2')
      .transition()
      .ease(d3.easeLinear)
      .duration(3000)
      .attr('cx', 400)
      .transition()
      .ease(d3.easeLinear)
      .attr('cx', 100)
      .on("end", repeat)
  }

  useEffect(() => {
      d3.selectAll('#circle1')
        .attr('r', 20)
        .attr('cx', function (d, i) {
        return i*40 + 100
      })

    d3.select('#shapes1')
      .style('background', 'blue')
  }, [])

  return (
    <div id="shapes1">
      <svg
        id="svgtest"
        width="100%" height="200"
        // viewBox="0 0 100 100"
      >
        <rect id="rect1" width="100" height="200" fill="red" />
        <circle id="circle1" cx="100" cy="30" r="70" fill="green" />
        <circle id="circle1" cx="100" cy="60" r="70" fill="green" />
        <circle id="circle1" cx="100" cy="90" r="70" fill="green" />
        <circle id="circle2" cx="100" cy="200" r="70" fill="white" />
      </svg>
    </div>
  )
}

const BenefitsGraph = () => {
  return (
    <div>
      {/* <SVGTest /> */}
      {/* <TestGraph /> */}
      <TestGraph2 />
    </div>
  )
}

export default BenefitsGraph