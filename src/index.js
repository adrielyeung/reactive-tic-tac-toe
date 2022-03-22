import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';

// Function component - a component without state can be stored as function
// and not child class of React.Component
function Square(props) {
  let className = "square";
  if (props.highlight) {
    className += "-highlight";
  }
    return (
      <button 
        className={className}
        onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
  
  class Board extends React.Component {
    renderSquare(i, highlight) {
      return (
        <Square 
          value={this.props.squares[i]}
          highlight={highlight}
          onClick={() => this.props.onClick(i)} 
        />
      );
    }

    renderRow(row, winningPos) {
      var rows = [];

      for (let col = 0; col < 3; col++) {
        let val = row*3+col;
        let highlightSquare = false;
        if (winningPos && winningPos.includes(val)) {
          highlightSquare = true;
        }
        rows = rows.concat([this.renderSquare(val, highlightSquare)]);
      }
      return (
        <div className="board-row">
          {rows}
        </div>
      );
    }
  
    render() {
      var board = [];
      
      for (let row = 0; row < 3; row++) {
        board = board.concat([this.renderRow(row, this.props.winningPos)]);
      }

      return (
        <div>
          {board}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null),
          col: 0,
          row: 0,
        }],
        xIsNext: true,
        stepNumber: 0,
        sortAscend: true,
      };
    }

    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length-1];

      // slice creates a copy of the array, using a copy instead of changing directly
      // allows for history tracing and detecting changes
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          row: Math.floor(i/3)+1,
          col: i%3+1,
        }]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length,
      });
    }

    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }

    toggleSort() {
      this.setState({
        sortAscend: !this.state.sortAscend,
      });
    }

    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winnerAndPos = calculateWinner(current.squares);
      const winner = winnerAndPos ? winnerAndPos[0] : null;
      const winningPos = winnerAndPos ? winnerAndPos[1] : null;

      const moves = history.map((step, move) => {
        if (!this.state.sortAscend) move = history.length - move - 1;

        let desc = move ? 
          'Go to move #' + move :
          'Go to game start';
        
        if (this.state.stepNumber === move) {
          desc = <strong>{desc}</strong>;
        }

        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      });

      let status;
      if (winner) {
        status = 'Winner: ' + winner;
      } else if (this.state.stepNumber === 9) {
        status = 'Game is a draw';
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
      let lastMove = current.col ? 
        'Last move:\nRow: ' + current.row + '\nCol: ' + current.col:
        '';
      
      return (
        <div className="game">
          <div className="game-board">
            <Board 
              squares={current.squares}
              winningPos={winningPos}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <div className="lastmove">{lastMove}</div>
            <button onClick={() => this.toggleSort()}>Toggle move sort order</button>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [squares[a], lines[i]];
      }
    }
    return null;
  }
