// EcoNomics Garden Game - JavaScript Implementation
class EcoNomicsGame {
    constructor() {
        this.gameState = {
            week: 1,
            budget: 500,
            ecoScore: 50,
            gardenHealth: 70,
            communityHappiness: 60,
            totalRevenue: 0,
            totalExpenses: 0,
            isActive: true
        };
        
        this.currentAllocation = {
            seeds: 100,
            tools: 75,
            water: 100,
            marketing: 50,
            eco: 75
        };
        
        this.gardenPlots = Array(6).fill().map(() => ({
            crop: null,
            growth: 0,
            watered: false,
            health: 100
        }));
        
        this.achievements = [];
        this.tutorialStep = 0;
        this.currentPhase = 'welcome';
        
        this.tutorialSteps = [
            "Welcome to EcoNomics! You're now the manager of a sustainable garden.",
            "Each week, you'll plan your budget across 5 key areas: seeds, tools, water, marketing, and eco-upgrades.",
            "After budgeting, you'll manage your garden by planting, watering, and monitoring your crops.",
            "Then you'll sell your harvest at the farmer's market for revenue.",
            "Finally, you'll review your weekly performance and plan for the next week. Let's start!"
        ];
        
        this.cropTypes = [
            { name: 'Tomatoes', icon: '🍅', value: 15, growthTime: 2 },
            { name: 'Carrots', icon: '🥕', value: 10, growthTime: 1 },
            { name: 'Lettuce', icon: '🥬', value: 12, growthTime: 1 },
            { name: 'Peppers', icon: '🌶️', value: 18, growthTime: 3 },
            { name: 'Herbs', icon: '🌿', value: 20, growthTime: 2 }
        ];
        
        this.randomEvents = [
            { title: "Beneficial Insects", description: "Ladybugs arrived! Garden health +10", effect: { gardenHealth: 10 } },
            { title: "Rain Shower", description: "Natural watering saved $20", effect: { budget: 20 } },
            { title: "Pest Alert", description: "Aphids detected. Garden health -15", effect: { gardenHealth: -15 } },
            { title: "Market Day Bonus", description: "High demand! Next harvest +25% value", effect: { marketBonus: 1.25 } },
            { title: "Soil Depletion", description: "Crops growing slower. Need more compost.", effect: { growthRate: 0.8 } }
        ];
        
        this.init();
    }
    
    init() {
        this.bindEventListeners();
        this.showScreen('welcome-screen');
    }
    
    bindEventListeners() {
        // Welcome screen
        document.getElementById('start-tutorial').addEventListener('click', () => this.startTutorial());
        document.getElementById('skip-tutorial').addEventListener('click', () => this.startGame());
        
        // Tutorial controls
        document.getElementById('prev-tutorial').addEventListener('click', () => this.previousTutorialStep());
        document.getElementById('next-tutorial').addEventListener('click', () => this.nextTutorialStep());
        
        // Budget allocation sliders
        const sliders = ['seeds', 'tools', 'water', 'marketing', 'eco'];
        sliders.forEach(type => {
            const slider = document.getElementById(`${type}-slider`);
            slider.addEventListener('input', () => this.updateBudgetAllocation(type, slider.value));
        });
        
        document.getElementById('confirm-budget').addEventListener('click', () => this.proceedToGardenPhase());
        
        // Garden management
        document.getElementById('plant-crops').addEventListener('click', () => this.plantCrops());
        document.getElementById('water-crops').addEventListener('click', () => this.waterCrops());
        document.getElementById('check-soil').addEventListener('click', () => this.checkSoil());
        document.getElementById('eco-upgrade').addEventListener('click', () => this.performEcoUpgrade());
        document.getElementById('proceed-to-market').addEventListener('click', () => this.proceedToMarket());
        
        // Garden plots
        document.querySelectorAll('.garden-plot').forEach((plot, index) => {
            plot.addEventListener('click', () => this.selectPlot(index));
        });
        
        // Market phase
        document.getElementById('sell-produce').addEventListener('click', () => this.sellProduce());
        
        // Summary phase
        document.getElementById('next-week').addEventListener('click', () => this.nextWeek());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        
        // Event handling
        document.getElementById('handle-event').addEventListener('click', () => this.handleRandomEvent());
    }
    
    // Screen Management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentPhase = screenId;
    }
    
    showPhase(phaseId) {
        document.querySelectorAll('.game-phase').forEach(phase => {
            phase.classList.remove('active');
        });
        document.getElementById(phaseId).classList.add('active');
    }
    
    // Tutorial System
    startTutorial() {
        this.showScreen('tutorial-screen');
        this.tutorialStep = 0;
        this.updateTutorialContent();
    }
    
    updateTutorialContent() {
        document.getElementById('tutorial-text').innerHTML = `<p>${this.tutorialSteps[this.tutorialStep]}</p>`;
        document.getElementById('tutorial-progress').textContent = `${this.tutorialStep + 1} / ${this.tutorialSteps.length}`;
        
        document.getElementById('prev-tutorial').disabled = this.tutorialStep === 0;
        
        if (this.tutorialStep === this.tutorialSteps.length - 1) {
            document.getElementById('next-tutorial').textContent = 'Start Game';
        }
    }
    
    nextTutorialStep() {
        if (this.tutorialStep < this.tutorialSteps.length - 1) {
            this.tutorialStep++;
            this.updateTutorialContent();
        } else {
            this.startGame();
        }
    }
    
    previousTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorialContent();
        }
    }
    
    // Game Flow
    startGame() {
        this.showScreen('game-screen');
        this.showPhase('budget-phase');
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('week-counter').textContent = this.gameState.week;
        document.getElementById('budget').textContent = `$${this.gameState.budget}`;
        document.getElementById('eco-score').textContent = this.gameState.ecoScore;
        document.getElementById('garden-health').textContent = `${this.gameState.gardenHealth}%`;
    }
    
    // Budget Phase
    updateBudgetAllocation(type, value) {
        this.currentAllocation[type] = parseInt(value);
        document.getElementById(`${type}-amount`).textContent = `$${value}`;
        
        const totalAllocated = Object.values(this.currentAllocation).reduce((sum, val) => sum + val, 0);
        document.getElementById('total-allocated').textContent = totalAllocated;
        document.getElementById('remaining-budget').textContent = this.gameState.budget - totalAllocated;
        
        const confirmButton = document.getElementById('confirm-budget');
        confirmButton.disabled = totalAllocated > this.gameState.budget;
        
        if (totalAllocated > this.gameState.budget) {
            confirmButton.textContent = 'Over Budget!';
            confirmButton.classList.add('over-budget');
        } else {
            confirmButton.textContent = 'Confirm Budget';
            confirmButton.classList.remove('over-budget');
        }
    }
    
    proceedToGardenPhase() {
        const totalAllocated = Object.values(this.currentAllocation).reduce((sum, val) => sum + val, 0);
        if (totalAllocated <= this.gameState.budget) {
            this.gameState.budget -= totalAllocated;
            this.gameState.totalExpenses += totalAllocated;
            this.showPhase('garden-phase');
            this.updateGardenDisplay();
            
            // Trigger random events
            if (Math.random() < 0.3) {
                this.triggerRandomEvent();
            }
        }
    }
    
    // Garden Management
    updateGardenDisplay() {
        this.gardenPlots.forEach((plot, index) => {
            const plotElement = document.querySelector(`[data-plot="${index}"]`);
            const contentElement = plotElement.querySelector('.plot-content');
            
            if (plot.crop) {
                const crop = this.cropTypes.find(c => c.name === plot.crop);
                contentElement.innerHTML = `${crop.icon}<br>${plot.growth}%`;
                plotElement.className = `garden-plot ${plot.watered ? 'watered' : ''} ${plot.health < 50 ? 'unhealthy' : ''}`;
            } else {
                contentElement.textContent = 'Empty';
                plotElement.className = 'garden-plot empty';
            }
        });
    }
    
    plantCrops() {
        if (this.currentAllocation.seeds < 20) {
            alert("Not enough seed budget to plant crops!");
            return;
        }
        
        const availablePlots = this.gardenPlots.filter(plot => !plot.crop).length;
        if (availablePlots === 0) {
            alert("All plots are already planted!");
            return;
        }
        
        this.gardenPlots.forEach(plot => {
            if (!plot.crop && Math.random() < 0.7) {
                const randomCrop = this.cropTypes[Math.floor(Math.random() * this.cropTypes.length)];
                plot.crop = randomCrop.name;
                plot.growth = 25;
                plot.health = 100;
            }
        });
        
        this.updateGardenDisplay();
        this.showMessage("Crops planted successfully!");
    }
    
    waterCrops() {
        if (this.currentAllocation.water < 30) {
            alert("Not enough water budget!");
            return;
        }
        
        this.gardenPlots.forEach(plot => {
            if (plot.crop) {
                plot.watered = true;
                plot.growth = Math.min(100, plot.growth + 20);
                plot.health = Math.min(100, plot.health + 5);
            }
        });
        
        this.gameState.gardenHealth = Math.min(100, this.gameState.gardenHealth + 10);
        this.updateGardenDisplay();
        this.updateDisplay();
        this.showMessage("Garden watered! Crops are growing well.");
    }
    
    checkSoil() {
        const unhealthyPlots = this.gardenPlots.filter(plot => plot.health < 70).length;
        if (unhealthyPlots > 0) {
            this.showMessage(`Warning: ${unhealthyPlots} plots need attention. Consider eco-upgrades!`);
        } else {
            this.showMessage("Soil is healthy across all plots!");
        }
    }
    
    performEcoUpgrade() {
        if (this.currentAllocation.eco < 50) {
            alert("Not enough eco-upgrade budget!");
            return;
        }
        
        this.gameState.ecoScore += 15;
        this.gameState.gardenHealth += 10;
        this.gardenPlots.forEach(plot => {
            plot.health = Math.min(100, plot.health + 20);
        });
        
        this.updateGardenDisplay();
        this.updateDisplay();
        this.showMessage("Eco-upgrade installed! Garden health improved significantly.");
    }
    
    selectPlot(index) {
        const plot = this.gardenPlots[index];
        if (plot.crop) {
            const crop = this.cropTypes.find(c => c.name === plot.crop);
            this.showMessage(`${crop.icon} ${plot.crop}: ${plot.growth}% growth, ${plot.health}% health`);
        }
    }
    
    // Random Events
    triggerRandomEvent() {
        const event = this.randomEvents[Math.floor(Math.random() * this.randomEvents.length)];
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-description').textContent = event.description;
        document.getElementById('random-event').classList.remove('hidden');
        
        this.currentEvent = event;
    }
    
    handleRandomEvent() {
        if (this.currentEvent) {
            const effect = this.currentEvent.effect;
            
            if (effect.gardenHealth) this.gameState.gardenHealth += effect.gardenHealth;
            if (effect.budget) this.gameState.budget += effect.budget;
            if (effect.ecoScore) this.gameState.ecoScore += effect.ecoScore;
            
            this.gameState.gardenHealth = Math.max(0, Math.min(100, this.gameState.gardenHealth));
            this.gameState.ecoScore = Math.max(0, Math.min(100, this.gameState.ecoScore));
            
            this.updateDisplay();
            document.getElementById('random-event').classList.add('hidden');
            this.currentEvent = null;
        }
    }
    
    // Market Phase
    proceedToMarket() {
        this.showPhase('market-phase');
        this.evaluateHarvest();
        this.calculateMarketPrices();
    }
    
    evaluateHarvest() {
        const harvestItems = document.getElementById('harvest-items');
        harvestItems.innerHTML = '';
        
        this.harvestData = [];
        
        this.gardenPlots.forEach((plot, index) => {
            if (plot.crop && plot.growth >= 80) {
                const crop = this.cropTypes.find(c => c.name === plot.crop);
                const quality = this.calculateQuality(plot);
                
                this.harvestData.push({
                    crop: crop,
                    quality: quality,
                    baseValue: crop.value,
                    plotIndex: index
                });
                
                const harvestItem = document.createElement('div');
                harvestItem.className = 'harvest-item';
                harvestItem.innerHTML = `
                    <span>${crop.icon} ${crop.name}</span>
                    <span>Quality: ${quality}%</span>
                `;
                harvestItems.appendChild(harvestItem);
                
                // Reset plot after harvest
                plot.crop = null;
                plot.growth = 0;
                plot.watered = false;
            }
        });
        
        if (this.harvestData.length === 0) {
            harvestItems.innerHTML = '<p>No crops ready for harvest this week.</p>';
        }
    }
    
    calculateQuality(plot) {
        let quality = plot.health;
        if (plot.watered) quality += 10;
        if (this.currentAllocation.tools > 50) quality += 5;
        if (this.gameState.ecoScore > 70) quality += 10;
        
        return Math.min(100, quality);
    }
    
    calculateMarketPrices() {
        const priceList = document.getElementById('price-list');
        priceList.innerHTML = '';
        
        const marketDemand = Math.random() * 0.4 + 0.8; // 80% to 120% demand
        
        this.cropTypes.forEach(crop => {
            const price = Math.round(crop.value * marketDemand);
            const priceItem = document.createElement('div');
            priceItem.className = 'price-item';
            priceItem.innerHTML = `<span>${crop.icon} ${crop.name}</span><span>$${price}</span>`;
            priceList.appendChild(priceItem);
        });
    }
    
    sellProduce() {
        let totalRevenue = 0;
        let qualityBonus = 0;
        
        this.harvestData.forEach(item => {
            const baseRevenue = item.baseValue * (item.quality / 100);
            const marketingBonus = this.currentAllocation.marketing > 75 ? 1.2 : 1.0;
            const revenue = Math.round(baseRevenue * marketingBonus);
            
            totalRevenue += revenue;
            
            if (item.quality > 90) {
                qualityBonus += Math.round(revenue * 0.2);
            }
        });
        
        totalRevenue += qualityBonus;
        this.gameState.budget += totalRevenue;
        this.gameState.totalRevenue += totalRevenue;
        
        document.getElementById('total-revenue').textContent = totalRevenue;
        document.getElementById('quality-bonus').textContent = qualityBonus;
        
        setTimeout(() => {
            this.showWeeklySummary();
        }, 2000);
    }
    
    // Weekly Summary
    showWeeklySummary() {
        this.showPhase('summary-phase');
        
        const income = this.gameState.totalRevenue;
        const expenses = this.gameState.totalExpenses;
        const profit = income - expenses;
        
        document.getElementById('summary-income').textContent = income;
        document.getElementById('summary-expenses').textContent = expenses;
        document.getElementById('summary-profit').textContent = profit;
        
        document.getElementById('summary-eco-score').textContent = this.gameState.ecoScore;
        document.getElementById('summary-garden-health').textContent = this.gameState.gardenHealth;
        document.getElementById('summary-community').textContent = this.gameState.communityHappiness;
        
        this.updateCommunityHappiness();
        this.showFinancialTip();
        this.checkAchievements();
    }
    
    updateCommunityHappiness() {
        if (this.gameState.ecoScore > 80) {
            this.gameState.communityHappiness = Math.min(100, this.gameState.communityHappiness + 10);
        } else if (this.gameState.ecoScore < 30) {
            this.gameState.communityHappiness = Math.max(0, this.gameState.communityHappiness - 5);
        }
        
        document.getElementById('summary-community').textContent = this.gameState.communityHappiness;
    }
    
    showFinancialTip() {
        const tips = [
            "Invest more in eco-upgrades for better long-term profits!",
            "Higher quality crops sell for premium prices at market.",
            "Marketing investment helps increase your selling price.",
            "Regular watering significantly improves crop quality.",
            "Balanced budget allocation leads to sustainable growth."
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        document.getElementById('weekly-tip').textContent = randomTip;
    }
    
    checkAchievements() {
        const achievementList = document.getElementById('achievement-list');
        let newAchievements = [];
        
        if (this.gameState.ecoScore >= 90 && !this.achievements.includes('eco-master')) {
            newAchievements.push({ id: 'eco-master', title: '🌱 Eco Master', description: 'Reach 90+ environmental score' });
        }
        
        if (this.gameState.week >= 10 && !this.achievements.includes('veteran-farmer')) {
            newAchievements.push({ id: 'veteran-farmer', title: '🚜 Veteran Farmer', description: 'Survive 10+ weeks' });
        }
        
        if (this.gameState.budget >= 1000 && !this.achievements.includes('profitable')) {
            newAchievements.push({ id: 'profitable', title: '💰 Profitable', description: 'Accumulate $1000+ budget' });
        }
        
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement.id);
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement-item new';
            achievementEl.innerHTML = `<strong>${achievement.title}</strong><br>${achievement.description}`;
            achievementList.appendChild(achievementEl);
        });
        
        if (newAchievements.length === 0) {
            achievementList.innerHTML = '<p>Keep playing to unlock achievements!</p>';
        }
    }
    
    // Game Progression
    nextWeek() {
        this.gameState.week++;
        this.gameState.budget += 100; // Weekly allowance
        
        // Reset allocations
        Object.keys(this.currentAllocation).forEach(key => {
            this.currentAllocation[key] = 50;
            const slider = document.getElementById(`${key}-slider`);
            if (slider) slider.value = 50;
        });
        
        this.showPhase('budget-phase');
        this.updateDisplay();
        this.updateBudgetAllocation('seeds', 50);
    }
    
    restartGame() {
        this.gameState = {
            week: 1,
            budget: 500,
            ecoScore: 50,
            gardenHealth: 70,
            communityHappiness: 60,
            totalRevenue: 0,
            totalExpenses: 0,
            isActive: true
        };
        
        this.gardenPlots = Array(6).fill().map(() => ({
            crop: null,
            growth: 0,
            watered: false,
            health: 100
        }));
        
        this.achievements = [];
        this.showScreen('welcome-screen');
    }
    
    // Utility Methods
    showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'game-message';
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EcoNomicsGame();
});