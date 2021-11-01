import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const SliderContainer = styled.div`
  display: flex;
  margin: 0 auto;
  flex-direction: row;
  width: ${props => props.width ? props.width + 60 + "px" : "200px"};
  color: rgb(228, 228, 228);
`

const RangeSlider = ({setParentValue, range, visibleRange}) => {
  const [value, setValue] = useState(0)
  const min = 0
  const max = range ? range : 100
  const width = 500

  useEffect(() => {
    setParentValue(value)
  }, [value])

  return (
    <SliderContainer
      width={width}
    >
      {visibleRange.min}
      <input
        style={{width: width + "px"}}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      {visibleRange.max}
    </SliderContainer>
  )
}

export default RangeSlider