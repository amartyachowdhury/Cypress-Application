import DashboardMap from './components/DashboardMap';

function App() {
    return (
        <div className="h-screen w-screen">
            <header className="p-4 bg-blue-700 text-white text-xl font-semibold shadow">
                🧭 Cypress – Report Dashboard
            </header>
            <DashboardMap />
        </div>
    );
}

export default App;