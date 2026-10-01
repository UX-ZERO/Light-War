import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CARD_BACK = '/cards/back.svg'

// Sound effects to be added to public/sounds/
const SOUNDS = {
  cardFlip: new Audio('/sounds/card-flip.wav'),    // Card flip sound
  cardDraw: new Audio('/sounds/card-draw.mp3'),    // Drawing cards sound
  victory: new Audio('/sounds/victory.mp3'),       // Winning round sound
  defeat: new Audio('/sounds/defeat.wav'),         // Losing round sound
  war: new Audio('/sounds/war.mp3'),              // War declaration sound
  countdown: new Audio('/sounds/countdown.wav')    // Countdown tick sound
}

function App() {
  const [playerDeck, setPlayerDeck] = useState([])
  const [computerDeck, setComputerDeck] = useState([])
  const [playerCard, setPlayerCard] = useState(null)
  const [computerCard, setComputerCard] = useState(null)
  const [gameStatus, setGameStatus] = useState('Press your deck to start')
  const [isFlipped, setIsFlipped] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isWar, setIsWar] = useState(false)
  const [warStep, setWarStep] = useState(0)
  const [warPCard, setWarPCard] = useState(null)
  const [warCCard, setWarCCard] = useState(null)
  const [warTiedCards, setWarTiedCards] = useState(null)

  // Initialize deck with test war scenario
  useEffect(() => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades']
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']
    
    // Create test deck for war scenario
    const createCard = (suit, rank) => ({
      suit,
      rank,
      value: ranks.indexOf(rank),
      image: `/cards/fronts/${suit}_${rank}.svg`
    })

    // Force a war scenario by making first cards equal
    const playerTestDeck = [
      createCard('hearts', 'queen'),  // First card - Queen
      createCard('spades', '5'),      // War card 1
      createCard('hearts', '8'),      // War card 2
      createCard('diamonds', '3'),    // War card 3
      createCard('clubs', 'king'),    // War card 4 (compare card)
    ]

    const computerTestDeck = [
      createCard('spades', 'queen'),   // First card - Queen
      createCard('diamonds', '4'),     // War card 1
      createCard('clubs', '7'),        // War card 2
      createCard('hearts', '2'),       // War card 3
      createCard('diamonds', '10'),    // War card 4 (compare card)
    ]

    // Add remaining cards
    const remainingCards = suits.flatMap(suit => 
      ranks.map(rank => createCard(suit, rank))
    ).filter(card => 
      !playerTestDeck.some(c => c.suit === card.suit && c.rank === card.rank) &&
      !computerTestDeck.some(c => c.suit === card.suit && c.rank === card.rank)
    )

    // Shuffle remaining cards
    const shuffledRemaining = [...remainingCards].sort(() => Math.random() - 0.5)
    
    // Split remaining cards
    const remainingHalf = Math.floor(shuffledRemaining.length / 2)
    
    // Set decks with test cards at the top
    setPlayerDeck([...playerTestDeck, ...shuffledRemaining.slice(0, remainingHalf)])
    setComputerDeck([...computerTestDeck, ...shuffledRemaining.slice(remainingHalf)])
  }, [])

  const handleWarClick = () => {
    if (warStep === 0) {
      // First step: show the tied cards and prompt for first war card
      setWarStep(1);
      setGameStatus("WAR! CLICK TO DRAW YOUR FIRST WAR CARD");
    } else if (warStep === 1) {
      // Draw first war card - face up
      if (playerDeck.length === 0 || computerDeck.length === 0) {
        // Not enough cards to continue the war
        endWarWithCurrentCards();
        return;
      }
      
      const playerCard = playerDeck[0];
      const computerCard = computerDeck[0];
      
      // Remove from decks
      setPlayerDeck(prev => prev.slice(1));
      setComputerDeck(prev => prev.slice(1));
      
      // Play card draw sound
      SOUNDS.cardDraw.play();
      
      setWarStep(2);
      setGameStatus("FIRST WAR CARDS DRAWN. CLICK TO DRAW SECOND WAR CARD");
    } else if (warStep === 2) {
      // Draw second war card - face up
      if (playerDeck.length === 0 || computerDeck.length === 0) {
        // Not enough cards to continue the war
        endWarWithCurrentCards();
        return;
      }
      
      const playerCard = playerDeck[0];
      const computerCard = computerDeck[0];
      
      // Remove from decks
      setPlayerDeck(prev => prev.slice(1));
      setComputerDeck(prev => prev.slice(1));
      
      // Play card draw sound
      SOUNDS.cardDraw.play();
      
      setWarStep(3);
      setGameStatus("SECOND WAR CARDS DRAWN. CLICK TO DRAW FINAL WAR CARD");
    } else if (warStep === 3) {
      // Draw third war card - face up
      if (playerDeck.length === 0 || computerDeck.length === 0) {
        // Not enough cards to continue the war
        endWarWithCurrentCards();
        return;
      }
      
      const playerCard = playerDeck[0];
      const computerCard = computerDeck[0];
      
      // Remove from decks
      setPlayerDeck(prev => prev.slice(1));
      setComputerDeck(prev => prev.slice(1));
      
      // Play card draw sound
      SOUNDS.cardDraw.play();
      
      setWarStep(4);
      setGameStatus("FINAL WAR CARDS DRAWN. CLICK TO RESOLVE THE WAR");
    } else if (warStep === 4) {
      // Resolve the war - compare the last cards drawn
      resolveWar();
    }
  };

  // Helper function to end war when not enough cards
  const endWarWithCurrentCards = () => {
    setGameStatus("Not enough cards to continue the war. Resolving with current cards...");
    setTimeout(() => {
      resolveWar();
    }, 1500);
  };

  // Function to determine the war winner and show results
  const resolveWar = () => {
    // In a real war game, we would compare the last cards drawn
    // For this demo, we'll compare the initial tied cards
    const playerTiedCard = warTiedCards.player;
    const computerTiedCard = warTiedCards.computer;
    
    // Get the final war cards if available (the third drawn card)
    const playerFinalCard = playerDeck.length > 0 ? playerDeck[0] : null;
    const computerFinalCard = computerDeck.length > 0 ? computerDeck[0] : null;
    
    // Determine which cards to compare for the war resolution
    const playerCompareCard = playerFinalCard || playerTiedCard;
    const computerCompareCard = computerFinalCard || computerTiedCard;
    
    // Collect all the war cards
    const warCards = [playerTiedCard, computerTiedCard]; // The initial tied cards
    
    // Add any war cards that were drawn
    for (let i = 0; i < 3; i++) {
      if (i < playerDeck.length) {
        warCards.push(playerDeck[i]);
      }
      if (i < computerDeck.length) {
        warCards.push(computerDeck[i]);
      }
    }
    
    // Show the final comparison
    setGameStatus(`Comparing ${playerCompareCard.rank} of ${playerCompareCard.suit} vs ${computerCompareCard.rank} of ${computerCompareCard.suit}`);
    
    // Wait a moment to let the player see the comparison
    setTimeout(() => {
      if (playerCompareCard.value > computerCompareCard.value) {
        // Player wins the war
        const newPlayerDeck = [...playerDeck.slice(Math.min(3, playerDeck.length)), ...warCards];
        const newComputerDeck = [...computerDeck.slice(Math.min(3, computerDeck.length))];
        
        setPlayerDeck(newPlayerDeck);
        setComputerDeck(newComputerDeck);
        setGameStatus(`YOU WIN THE WAR! Your ${playerCompareCard.rank} beats Computer's ${computerCompareCard.rank}. Collected ${warCards.length} cards!`);
        SOUNDS.victory.play();
      } else if (computerCompareCard.value > playerCompareCard.value) {
        // Computer wins the war
        const newPlayerDeck = [...playerDeck.slice(Math.min(3, playerDeck.length))];
        const newComputerDeck = [...computerDeck.slice(Math.min(3, computerDeck.length)), ...warCards];
        
        setPlayerDeck(newPlayerDeck);
        setComputerDeck(newComputerDeck);
        setGameStatus(`COMPUTER WINS THE WAR! Computer's ${computerCompareCard.rank} beats your ${playerCompareCard.rank}. Computer collected ${warCards.length} cards!`);
        SOUNDS.defeat.play();
      } else {
        // Another tie - in a real game, this would trigger another war
        // For simplicity, we'll just split the cards
        const halfCards = Math.floor(warCards.length / 2);
        const playerWarCards = warCards.slice(0, halfCards);
        const computerWarCards = warCards.slice(halfCards);
        
        const newPlayerDeck = [...playerDeck.slice(Math.min(3, playerDeck.length)), ...playerWarCards];
        const newComputerDeck = [...computerDeck.slice(Math.min(3, computerDeck.length)), ...computerWarCards];
        
        setPlayerDeck(newPlayerDeck);
        setComputerDeck(newComputerDeck);
        setGameStatus(`ANOTHER TIE! Both have ${playerCompareCard.rank}. Cards are split evenly: You got ${playerWarCards.length}, Computer got ${computerWarCards.length}.`);
      }
      
      // Reset war state after a delay to show the result
      setTimeout(() => {
        setIsWar(false);
        setWarStep(0);
        setGameStatus("CLICK YOUR DECK TO PLAY THE NEXT CARD");
        setPlayerCard(null);
        setComputerCard(null);
        setWarTiedCards(null);
      }, 4000); // Longer delay to let player read the result
    }, 2000);
  };

  const playCard = () => {
    if (playerDeck.length === 0 || computerDeck.length === 0 || isProcessing || isWar) return;
    
    setIsProcessing(true);
    
    // Draw cards
    const playerCard = playerDeck[0];
    const computerCard = computerDeck[0];
    
    // Set the cards to be displayed - immediately face up
    setPlayerCard(playerCard);
    setComputerCard(computerCard);
    setIsFlipped(true); // Always face up
    
    // Remove from decks
    const newPlayerDeck = playerDeck.slice(1);
    const newComputerDeck = computerDeck.slice(1);
    setPlayerDeck(newPlayerDeck);
    setComputerDeck(newComputerDeck);
    
    // Play card draw sound
    SOUNDS.cardDraw.play();
    
    // Show what's happening - immediately show the comparison
    setGameStatus(`Your ${playerCard.rank} of ${playerCard.suit} vs Computer's ${computerCard.rank} of ${computerCard.suit}`);
    
    // Wait a moment then determine the winner
    setTimeout(() => {
      // Determine winner
      if (playerCard.value > computerCard.value) {
        setGameStatus(`You win with ${playerCard.rank} of ${playerCard.suit}!`);
        SOUNDS.victory.play();
        setPlayerDeck([...newPlayerDeck, playerCard, computerCard]);
        
        // Clear the table after a moment
        setTimeout(() => {
          setPlayerCard(null);
          setComputerCard(null);
          setGameStatus("CLICK YOUR DECK TO PLAY THE NEXT CARD");
        }, 2000);
        
      } else if (computerCard.value > playerCard.value) {
        setGameStatus(`Computer wins with ${computerCard.rank} of ${computerCard.suit}.`);
        SOUNDS.defeat.play();
        setComputerDeck([...newComputerDeck, playerCard, computerCard]);
        
        // Clear the table after a moment
        setTimeout(() => {
          setPlayerCard(null);
          setComputerCard(null);
          setGameStatus("CLICK YOUR DECK TO PLAY THE NEXT CARD");
        }, 2000);
        
      } else {
        // It's a war! Keep the cards on the table
        setGameStatus("IT'S WAR! Cards are tied. Click to start the war!");
        SOUNDS.war.play();
        setIsWar(true);
        setWarStep(0);
        
        // Keep the tied cards visible by not clearing them
        // We'll store them in state for comparison at the end
        setWarTiedCards({
          player: playerCard,
          computer: computerCard
        });
      }
      
      // Check if game is over
      if (newPlayerDeck.length === 0) {
        setGameStatus("Game over! Computer wins!");
        SOUNDS.gameOver.play();
      } else if (newComputerDeck.length === 0) {
        setGameStatus("Game over! You win!");
        SOUNDS.victory.play();
      }
      
      setIsProcessing(false);
    }, 1500); // Give player time to see the comparison
  };

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center justify-between py-4 px-8">
      {/* Computer's deck */}
      <div className="w-full flex flex-col items-center mt-8">
        <h2 className="text-white mb-2">Computer's Deck ({computerDeck.length})</h2>
        <motion.div 
          className="h-40 w-28 rounded-lg shadow-xl overflow-hidden"
          style={{ 
            backgroundImage: `url(${CARD_BACK})`,
            backgroundSize: 'cover'
          }}
        />
      </div>

      {/* Game area */}
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <div className="text-xl font-bold text-white text-center max-w-md px-4">{gameStatus}</div>
        
        {/* War progress indicator - simplified */}
        {isWar && (
          <div className="flex flex-col items-center mb-2">
            <div className="text-lg text-white mb-2">
              War Step: {warStep} of 4
            </div>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    warStep > step ? 'bg-green-500 text-black font-bold' : 
                    warStep === step ? 'bg-yellow-500 text-black font-bold' : 
                    'bg-gray-600 text-white'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-16 items-center">
          <div className="flex flex-col items-center">
            <AnimatePresence>
              {computerCard && (
                <div className="relative">
                  {/* War cards stack for computer */}
                  {isWar && (
                    <div className="relative">
                      {/* Initial tied card is always visible during war */}
                      <div
                        className="h-40 w-28 rounded-lg shadow-xl"
                        style={{
                          backgroundImage: `url(${computerCard.image})`,
                          backgroundSize: 'cover',
                          zIndex: 1
                        }}
                      >
                        <div className="absolute -top-6 left-0 w-full text-center text-xs text-white font-bold">
                          Tied Card
                        </div>
                      </div>
                      
                      {/* Only show the war cards for the current step or later */}
                      {warStep >= 1 && (
                        <motion.div
                          initial={{ x: 0, y: 0 }}
                          animate={{ x: -60, y: -5 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="absolute h-40 w-28 rounded-lg shadow-xl border-2 border-green-500"
                          style={{ 
                            backgroundImage: `url(${computerDeck.length > 0 ? computerDeck[0].image : CARD_BACK})`,
                            backgroundSize: 'cover',
                            zIndex: 2
                          }}
                        >
                          <div className="absolute -top-6 left-0 w-full text-center text-xs text-green-500 font-bold">
                            War Card 1
                          </div>
                        </motion.div>
                      )}
                      
                      {warStep >= 2 && (
                        <motion.div
                          initial={{ x: 0, y: 0 }}
                          animate={{ x: -75, y: -10 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="absolute h-40 w-28 rounded-lg shadow-xl border-2 border-green-500"
                          style={{ 
                            backgroundImage: `url(${computerDeck.length > 1 ? computerDeck[1].image : CARD_BACK})`,
                            backgroundSize: 'cover',
                            zIndex: 3
                          }}
                        >
                          <div className="absolute -top-6 left-0 w-full text-center text-xs text-green-500 font-bold">
                            War Card 2
                          </div>
                        </motion.div>
                      )}
                      
                      {warStep >= 3 && (
                        <motion.div
                          initial={{ x: 0, y: 0 }}
                          animate={{ x: -90, y: -15 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="absolute h-40 w-28 rounded-lg shadow-xl border-2 border-green-500"
                          style={{ 
                            backgroundImage: `url(${computerDeck.length > 2 ? computerDeck[2].image : CARD_BACK})`,
                            backgroundSize: 'cover',
                            zIndex: 4
                          }}
                        >
                          <div className="absolute -top-6 left-0 w-full text-center text-xs text-green-500 font-bold">
                            War Card 3
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                  
                  {/* Main card - only show if not in war */}
                  {!isWar && (
                    <div
                      className="h-40 w-28 rounded-lg shadow-xl mb-2"
                      style={{
                        backgroundImage: `url(${computerCard.image})`,
                        backgroundSize: 'cover'
                      }}
                    />
                  )}
                </div>
              )}
              <div className="text-white text-sm mt-2">
                Computer's Card
              </div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center">
            <AnimatePresence>
              {playerCard && (
                <div className="relative">
                  {/* War cards stack for player */}
                  {isWar && (
                    <div className="relative">
                      {/* Initial tied card is always visible during war */}
                      <div
                        className="h-40 w-28 rounded-lg shadow-xl"
                        style={{
                          backgroundImage: `url(${playerCard.image})`,
                          backgroundSize: 'cover',
                          zIndex: 1
                        }}
                      >
                        <div className="absolute -top-6 left-0 w-full text-center text-xs text-white font-bold">
                          Tied Card
                        </div>
                      </div>
                      
                      {/* Only show the face-down cards for the current step or later */}
                      {warStep >= 1 && (
                        <motion.div
                          initial={{ x: 0, y: 0 }}
                          animate={{ x: 60, y: -5 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="absolute h-40 w-28 rounded-lg shadow-xl border-2 border-green-500"
                          style={{ 
                            backgroundImage: `url(${playerDeck.length > 0 ? playerDeck[0].image : CARD_BACK})`,
                            backgroundSize: 'cover',
                            zIndex: 2
                          }}
                        >
                          <div className="absolute -top-6 left-0 w-full text-center text-xs text-green-500 font-bold">
                            War Card 1
                          </div>
                        </motion.div>
                      )}
                      
                      {warStep >= 2 && (
                        <motion.div
                          initial={{ x: 0, y: 0 }}
                          animate={{ x: 75, y: -10 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="absolute h-40 w-28 rounded-lg shadow-xl border-2 border-green-500"
                          style={{ 
                            backgroundImage: `url(${playerDeck.length > 1 ? playerDeck[1].image : CARD_BACK})`,
                            backgroundSize: 'cover',
                            zIndex: 3
                          }}
                        >
                          <div className="absolute -top-6 left-0 w-full text-center text-xs text-green-500 font-bold">
                            War Card 2
                          </div>
                        </motion.div>
                      )}
                      
                      {warStep >= 3 && (
                        <motion.div
                          initial={{ x: 0, y: 0 }}
                          animate={{ x: 90, y: -15 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="absolute h-40 w-28 rounded-lg shadow-xl border-2 border-green-500"
                          style={{ 
                            backgroundImage: `url(${playerDeck.length > 2 ? playerDeck[2].image : CARD_BACK})`,
                            backgroundSize: 'cover',
                            zIndex: 4
                          }}
                        >
                          <div className="absolute -top-6 left-0 w-full text-center text-xs text-green-500 font-bold">
                            War Card 3
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                  
                  {/* Main card - only show if not in war */}
                  {!isWar && (
                    <div
                      className="h-40 w-28 rounded-lg shadow-xl mb-2"
                      style={{
                        backgroundImage: `url(${playerCard.image})`,
                        backgroundSize: 'cover'
                      }}
                    />
                  )}
                </div>
              )}
              <div className="text-white text-sm mt-2">
                Your Card
              </div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Player's deck */}
      <div className="w-full flex flex-col items-center mb-8">
        <h2 className="text-white mb-4">Your Deck ({playerDeck.length})</h2>
        <motion.div 
          className={`h-40 w-28 rounded-lg shadow-xl overflow-hidden ${!isProcessing ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isWar ? handleWarClick : playCard}
          style={{ 
            backgroundImage: `url(${CARD_BACK})`,
            backgroundSize: 'cover'
          }}
        />
      </div>
    </div>
  )
}

export default App
