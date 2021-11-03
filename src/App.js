import React, { useState, useEffect } from "react";
import {
  LineGraph,
  MaxAgeGraph,
  DelayedMaxAgeGraph,
} from "./Components/BenefitsGraphs";
import * as Styled from "./App.styled";
import "./App.css";
import { Dropdown } from "./Components/Dropdown";

const birthYears = [
  "1943 to 1954",
  "1955",
  "1956",
  "1957",
  "1958",
  "1959",
  "1960 or later",
];

const App = () => {
  const [birthYear, setBirthYear] = useState("1943");
  const [monthlyBenefit, setMonthlyBenefit] = useState(1000);

  const handleBirthYearChange = (birthYear) =>
    setBirthYear(birthYear.slice(0, 4));

  const handleInput = (input) =>
    parseInt(input) === NaN ? null : setMonthlyBenefit(parseInt(input));

  return (
    <Styled.DocumentContainer>
      <h4>What the heck am I looking at?</h4>
      <Styled.TextContainer>
        These are a series of graphs meant to make the process of estimating SSI
        benefits a little less painful. There are three graphs; the first shows
        an expected monthly amount based on the age in which you decide to begin
        withdrawing your SSI benefits. The second graph is an estimation of at
        least how much you could expect to make, <i>in total</i>, from the time
        you begin withdrawing up to some number of years into the future.
        Lastly, the third is exactly the same as the second, except that it
        takes into account <i>delayed</i> retirement benefits, which begin at
        the full retirement age from 66 (in 1943-1954) to 67 (in 1960) and
        continue until age 70, at which point they no longer increase.
      </Styled.TextContainer>
      <h4>Why?</h4>
      <Styled.TextContainer>
        While all of the needed information is clearly given at the official SSA
        website, it's not terribly straightforward as to what one could
        reasonably expect only by looking through ages and percentages. By
        presenting the information in a series of graphs, it becomes <i>much</i>{" "}
        easier to gauge how <i>reduced</i> and <i>delayed</i> benefits actually
        impact one's future quality of life.
      </Styled.TextContainer>
      <h4>Very important disclaimer:</h4>
      <Styled.TextContainer>
        These amounts are based on a standard figure of <b>$1,000 per month</b>,
        multiplied by the various reductions or additions dependent on the age
        in which you begin taking out benefits. The SSA does a few extra
        calculations depending on how much you've made over your past 35 "best"
        working years, including earned and unearned income, whether or not
        you're a government worker, and so on. Additionally, a{" "}
        <i>Cost-of-Living Adjustment</i> (COLA) is applied to your payments,
        which is meant to compensate for inflation.{" "}
        <i>There are no such calculations or adjuments here.</i> This is only
        meant to give an overview of how SSI benefits vary with respect to one's
        retirement age. All data used for calculating amounts was borrowed from{" "}
        <a href="https://www.ssa.gov/benefits/retirement/planner/agereduction.html">
          https://www.ssa.gov/benefits/retirement/planner/agereduction.html
        </a>{" "}
        and{" "}
        <a href="https://www.ssa.gov/benefits/retirement/planner/delayret.html">
          https://www.ssa.gov/benefits/retirement/planner/delayret.html
        </a>
        .
      </Styled.TextContainer>
      <br />
      To get started, select your year of birth:
      <Dropdown options={birthYears} setParentValue={handleBirthYearChange} />
      {/* <br />
        If you've calculated your own monthly benefit amount, please feel free to enter it below, and the numbers will change accordingly:
        <br />
      <input
        defaultValue={1000}
        onChange={e => handleInput(e.target.value)}
        style={{
          width: "70px",
          textAlign: "center"
        }}
      /> */}
      <Styled.GraphContainer>
        <LineGraph
          key={birthYear}
          monthlyBenefit={monthlyBenefit}
          birthYear={birthYear}
        />
      </Styled.GraphContainer>
      <Styled.TextContainer>
        This is the expected monthly amount at the age in which you begin taking
        out your benefits.
      </Styled.TextContainer>
      <Styled.GraphContainer>
        <MaxAgeGraph key={birthYear} birthYear={birthYear} />
      </Styled.GraphContainer>
      <Styled.TextContainer>
        This is the total amount you would receive up to a certain age depending
        on the age in which you begin taking out benefits.
      </Styled.TextContainer>
      <Styled.GraphContainer>
        <DelayedMaxAgeGraph key={birthYear} birthYear={birthYear} />
      </Styled.GraphContainer>
      This is a similar graph for benefits taken out after full retirement age.
      <br />
    </Styled.DocumentContainer>
  );
};

export default App;
