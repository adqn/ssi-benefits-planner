import React, { useState, useEffect } from 'react';
import { LineGraph, OptimalAgeGraph, DelayedOptimalAgeGraph } from './Components/BenefitsGraphs'
import * as Styled from './App.styled'
import './App.css';

const App = () => {
  return (
    <Styled.DocumentContainer>
        Some text to break the monotony of graphs. 
        This is a monthly benefits graph.
      <Styled.GraphContainer>
        <LineGraph />
      </Styled.GraphContainer>
        This is a graph displaying the total amount one would receive up to a certain age. 
      <Styled.GraphContainer>
        <OptimalAgeGraph />
      </Styled.GraphContainer>
        This is a similar graph for post-full retirement age.
      <Styled.GraphContainer>
        <DelayedOptimalAgeGraph />
      </Styled.GraphContainer>
    </Styled.DocumentContainer>
  );
}

export default App;