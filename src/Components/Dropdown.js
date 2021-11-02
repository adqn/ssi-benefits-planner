import React, { useState } from 'react'

export const Dropdown = ({ options, setParentValue }) => {
  return (
    <div>
      <select
        // value={value}
        onChange={e => setParentValue(e.target.value)}
      >
        {options.map(option => {
          return <option value={option}>{option}</option>
          })}
      </select>
    </div>
  )
}

export default Dropdown