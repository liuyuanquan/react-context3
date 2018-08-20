import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const theme = (state = 'light', action) => {
  switch (action.type) {
    case 'CHANGE_THEME':
      return action.theme
    default:
      return state
  }
}
const reducer = combineReducers({theme})

const store = createStore(reducer)

const StoreContext = React.createContext({
  store
})

const getDisplayName = component => {
  return component.displayName || component.name || 'Component'
}

const withTheme = WrappedComponent => {
  class HOC extends Component {
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`
    constructor(props) {
      super(props)
      const {store} = this.props
      this.state = store.getState()
    }
    render() {
      const {store, forwardRef} = this.props
      let newProps = {
        dispatch: store.dispatch
      }
      Object.keys(this.props).filter(key => key !== 'store' && key !== 'forwardRef' && key !== 'children').forEach(item => {
        newProps[item] = this.props[item]
      })
      return (
        <WrappedComponent {...newProps} {...this.state} ref={forwardRef}></WrappedComponent>
      )
    }
    componentDidMount() {
      const {store} = this.props
      store.subscribe(() => {
        this.setState(store.getState)
      })
    }
  }
  return React.forwardRef((props, ref) => (
    <HOC {...props} forwardRef={ref}/>
  ))
}

@withTheme
class Header extends Component {
  render() {
    const {dispatch, theme} = this.props
    return (
      <header className={theme}>
        <label htmlFor='theme'>切换主题：</label>
        <select name='theme' value={theme} onChange={e => {dispatch({type: 'CHANGE_THEME', theme: e.currentTarget.value})}}>
          <option value='dark'>dark</option>
          <option value='light'>light</option>
          <option value='none'>none</option>
        </select>
      </header>
    )
  }
}

@withTheme
class Aside extends Component {
  render() {
    const {theme} = this.props
    return (
      <aside className={theme}>
        侧边栏
      </aside>
    )
  }
}

@withTheme
class Main extends Component {
  render() {
    const {theme} = this.props
    return (
      <main className={theme}>
        主体
      </main>
    )
  }
}

class Provider extends Component {
  render() {
    const {children, store} = this.props
    return (
      <StoreContext.Provider value={store}>
        <StoreContext.Consumer>
          {
            store => React.Children.map(children, (child, index, arr) => {
              return React.cloneElement(child, {store}, null)
            })
          }
        </StoreContext.Consumer>
      </StoreContext.Provider>
    )
  }
}

ReactDOM.render(
<Provider store={store}>
  <Header ref={React.createRef()}/>
  <Aside ref={React.createRef()}/>
  <Main ref={React.createRef()}/>
</Provider>, document.getElementById('root'))

registerServiceWorker()
