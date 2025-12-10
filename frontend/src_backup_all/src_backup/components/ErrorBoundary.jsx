import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(error, info){ console.error("UI error:", error, info); }
  render(){
    if (this.state.hasError){
      return (
        <div style={{padding:16, border:"1px solid #F39C12", borderRadius:12, background:"#1a1a1a", color:"#ffd9a3"}}>
          <h3>Something went wrong</h3>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}


