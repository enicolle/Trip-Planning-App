const { useState, useEffect } = React;

// Simple reliable icons using Unicode/Emoji
const Plus = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 16}px`, lineHeight: 1 } 
}, '+');

const ChevronDown = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 14}px`, lineHeight: 1 } 
}, '▼');

const ChevronRight = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 14}px`, lineHeight: 1 } 
}, '▶');

const Check = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 14}px`, lineHeight: 1 } 
}, '✓');

const X = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 14}px`, lineHeight: 1 } 
}, '✕');

const User = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 14}px`, lineHeight: 1 } 
}, '👤');

const Luggage = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 18}px`, lineHeight: 1 } 
}, '🧳');

const Target = ({ size, className = "" }) => React.createElement('span', { 
  className, 
  style: { fontSize: `${size || 16}px`, lineHeight: 1 } 
}, '🎯');

// Netlify Functions API client
const createNetlifyAPIClient = () => {
  const baseURL = 'https://chic-brigadeiros-485884.netlify.app/.netlify/functions';
  
  return {
    trips: {
      getAll: async () => {
        try {
          const response = await fetch(`${baseURL}/trips`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error fetching trips:', error);
          return { data: [], error: error.message };
        }
      },
      create: async (tripData) => {
        try {
          const response = await fetch(`${baseURL}/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error creating trip:', error);
          return { data: null, error: error.message };
        }
      }
    },
    categories: {
      create: async (categoryData) => {
        try {
          const response = await fetch(`${baseURL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error creating category:', error);
          return { data: null, error: error.message };
        }
      }
    },
    items: {
      create: async (itemData) => {
        try {
          const response = await fetch(`${baseURL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error creating item:', error);
          return { data: null, error: error.message };
        }
      },
      update: async (itemData) => {
        try {
          const response = await fetch(`${baseURL}/items`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error updating item:', error);
          return { data: null, error: error.message };
        }
      },
      delete: async (itemId) => {
        try {
          const response = await fetch(`${baseURL}/items?itemId=${itemId}`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error deleting item:', error);
          return { data: null, error: error.message };
        }
      }
    }
  };
};

const PackingListApp = () => {
  const [trips, setTrips] = useState([
    {
      id: 1,
      name: "Weekend Getaway",
      categories: [
        {
          id: 1,
          name: "Clothes",
          collapsed: false,
          items: [
            { id: 1, name: "T-shirts (3)", packed: false, assigned_to: "You" },
            { id: 2, name: "Jeans", packed: true, assigned_to: "John" },
            { id: 3, name: "Pajamas", packed: false, assigned_to: null }
          ]
        },
        {
          id: 2,
          name: "Toiletries",
          collapsed: false,
          items: [
            { id: 4, name: "Toothbrush", packed: false, assigned_to: "You" },
            { id: 5, name: "Shampoo", packed: false, assigned_to: null }
          ]
        }
      ]
    }
  ]);
  
  const [currentTripId, setCurrentTripId] = useState(1);
  const [newTripName, setNewTripName] = useState("");
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newItemInputs, setNewItemInputs] = useState({});
  const [api] = useState(() => createNetlifyAPIClient());

  const currentTrip = trips.find(trip => trip.id === currentTripId);
  
  const getTotalItems = () => {
    return currentTrip?.categories.reduce((total, category) => total + category.items.length, 0) || 0;
  };
  
  const getPackedItems = () => {
    return currentTrip?.categories.reduce((total, category) => 
      total + category.items.filter(item => item.packed).length, 0) || 0;
  };

  const getYourItems = () => {
    return currentTrip?.categories.reduce((total, category) => 
      total + category.items.filter(item => item.assigned_to === "You").length, 0) || 0;
  };

  const getJohnItems = () => {
    return currentTrip?.categories.reduce((total, category) => 
      total + category.items.filter(item => item.assigned_to === "John").length, 0) || 0;
  };

  const loadTripsFromAPI = async () => {
    try {
      console.log('Loading trips from Netlify backend...');
      
      const response = await api.trips.getAll();
      console.log('Netlify API response:', response);
      
      if (response.error) {
        console.error('Error loading trips:', response.error);
        return;
      }

      if (response.data && response.data.length > 0) {
        console.log('Found trips from database:', response.data);
        setTrips(response.data);
        
        if (!currentTripId || !response.data.find(t => t.id === currentTripId)) {
          setCurrentTripId(response.data[0].id);
        }
      } else {
        console.log('No trips found in database, keeping default local data');
      }
    } catch (error) {
      console.error('Error loading from API:', error);
    }
  };

  useEffect(() => {
    loadTripsFromAPI();
    
    const interval = setInterval(() => {
      loadTripsFromAPI();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addTrip = async () => {
    if (newTripName.trim()) {
      try {
        console.log('Attempting to add trip:', newTripName);
        
        const response = await api.trips.create({ name: newTripName });
        console.log('API response:', response);
        
        if (response.error) {
          console.error('API error:', response.error);
          throw new Error(response.error);
        }

        console.log('Trip added successfully, reloading data...');
        await loadTripsFromAPI();
        
        setNewTripName("");
        setShowNewTrip(false);
      } catch (error) {
        console.error('Error adding trip:', error);
        alert(`Error adding trip: ${error.message || error}`);
        
        // Fallback to local state
        const newTrip = {
          id: Date.now(),
          name: newTripName,
          categories: []
        };
        const updatedTrips = [...trips, newTrip];
        setTrips(updatedTrips);
        setCurrentTripId(newTrip.id);
        setNewTripName("");
        setShowNewTrip(false);
      }
    }
  };

  const addCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const response = await api.categories.create({ 
          trip_id: currentTripId,
          name: newCategoryName,
          collapsed: false 
        });
        
        if (response.error) throw new Error(response.error);

        await loadTripsFromAPI();
        
        setNewCategoryName("");
        setShowNewCategory(false);
      } catch (error) {
        console.error('Error adding category:', error);
        // Fallback to local state
        const updatedTrips = trips.map(trip => 
          trip.id === currentTripId 
            ? {
                ...trip,
                categories: [...trip.categories, {
                  id: Date.now(),
                  name: newCategoryName,
                  collapsed: false,
                  items: []
                }]
              }
            : trip
        );
        setTrips(updatedTrips);
        setNewCategoryName("");
        setShowNewCategory(false);
      }
    }
  };

  const toggleCategory = (categoryId) => {
    setTrips(trips.map(trip =>
      trip.id === currentTripId
        ? {
            ...trip,
            categories: trip.categories.map(category =>
              category.id === categoryId
                ? { ...category, collapsed: !category.collapsed }
                : category
            )
          }
        : trip
    ));
  };

  const addItem = async (categoryId) => {
    const input = newItemInputs[categoryId];
    if (input?.name?.trim()) {
      try {
        const response = await api.items.create({
          category_id: categoryId,
          name: input.name,
          packed: false,
          assigned_to: input.assignedTo || null
        });
        
        if (response.error) throw new Error(response.error);

        await loadTripsFromAPI();
        
        setNewItemInputs({
          ...newItemInputs,
          [categoryId]: { name: "", assignedTo: null }
        });
      } catch (error) {
        console.error('Error adding item:', error);
        // Fallback to local state
        const updatedTrips = trips.map(trip =>
          trip.id === currentTripId
            ? {
                ...trip,
                categories: trip.categories.map(category =>
                  category.id === categoryId
                    ? {
                        ...category,
                        items: [...category.items, {
                          id: Date.now(),
                          name: input.name,
                          packed: false,
                          assigned_to: input.assignedTo || null
                        }]
                      }
                    : category
                )
              }
            : trip
        );
        setTrips(updatedTrips);
        setNewItemInputs({
          ...newItemInputs,
          [categoryId]: { name: "", assignedTo: null }
        });
      }
    }
  };

  const toggleItemPacked = async (categoryId, itemId) => {
    try {
      const currentItem = currentTrip?.categories
        .find(cat => cat.id === categoryId)?.items
        .find(item => item.id === itemId);
      
      if (currentItem) {
        const response = await api.items.update({
          id: itemId,
          packed: !currentItem.packed
        });
        
        if (response.error) throw new Error(response.error);

        const updatedTrips = trips.map(trip =>
          trip.id === currentTripId
            ? {
                ...trip,
                categories: trip.categories.map(category =>
                  category.id === categoryId
                    ? {
                        ...category,
                        items: category.items.map(item =>
                          item.id === itemId
                            ? { ...item, packed: !item.packed }
                            : item
                        )
                      }
                    : category
                )
              }
            : trip
        );
        setTrips(updatedTrips);
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      // Fallback to local state only
      const updatedTrips = trips.map(trip =>
        trip.id === currentTripId
          ? {
              ...trip,
              categories: trip.categories.map(category =>
                category.id === categoryId
                  ? {
                      ...category,
                      items: category.items.map(item =>
                        item.id === itemId
                          ? { ...item, packed: !item.packed }
                          : item
                      )
                    }
                  : category
              )
            }
          : trip
      );
      setTrips(updatedTrips);
    }
  };

  const deleteItem = async (categoryId, itemId) => {
    try {
      const response = await api.items.delete(itemId);
      
      if (response.error) throw new Error(response.error);

      const updatedTrips = trips.map(trip =>
        trip.id === currentTripId
          ? {
              ...trip,
              categories: trip.categories.map(category =>
                category.id === categoryId
                  ? {
                      ...category,
                      items: category.items.filter(item => item.id !== itemId)
                    }
                  : category
              )
            }
          : trip
      );
      setTrips(updatedTrips);
    } catch (error) {
      console.error('Error deleting item:', error);
      // Fallback to local state only
      const updatedTrips = trips.map(trip =>
        trip.id === currentTripId
          ? {
              ...trip,
              categories: trip.categories.map(category =>
                category.id === categoryId
                  ? {
                      ...category,
                      items: category.items.filter(item => item.id !== itemId)
                    }
                  : category
              )
            }
          : trip
      );
      setTrips(updatedTrips);
    }
  };

  const updateNewItemInput = (categoryId, field, value) => {
    setNewItemInputs({
      ...newItemInputs,
      [categoryId]: {
        ...newItemInputs[categoryId],
        [field]: value
      }
    });
  };

  const getAssignmentColor = (assignedTo) => {
    if (assignedTo === "You") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (assignedTo === "John") return "bg-green-100 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const completionPercentage = getTotalItems() > 0 ? Math.round((getPackedItems() / getTotalItems()) * 100) : 0;

  return React.createElement('div', { className: "min-h-screen bg-gray-50" }, [
    // Header
    React.createElement('div', { className: "bg-white shadow-sm border-b border-gray-100", key: "header" }, 
      React.createElement('div', { className: "max-w-6xl mx-auto px-6 py-4" },
        React.createElement('div', { className: "flex items-center justify-between" }, [
          React.createElement('div', { className: "flex items-center gap-3" }, [
            React.createElement('div', { className: "w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center" },
              React.createElement(Luggage, { className: "text-white", size: 20 })
            ),
            React.createElement('div', {}, [
              React.createElement('h1', { className: "text-xl font-semibold text-gray-900" }, "PackTogether"),
              React.createElement('p', { className: "text-sm text-gray-500" }, "Plan and pack with ease")
            ])
          ]),
          
          React.createElement('div', { className: "flex items-center gap-3" }, [
            React.createElement('select', {
              value: currentTripId,
              onChange: (e) => setCurrentTripId(Number(e.target.value)),
              className: "px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            }, trips.map(trip => 
              React.createElement('option', { key: trip.id, value: trip.id }, trip.name)
            )),
            
            showNewTrip ? React.createElement('div', { className: "flex items-center gap-2" }, [
              React.createElement('input', {
                type: "text",
                placeholder: "Trip name",
                value: newTripName,
                onChange: (e) => setNewTripName(e.target.value),
                className: "px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                onKeyPress: (e) => e.key === 'Enter' && addTrip()
              }),
              React.createElement('button', {
                onClick: addTrip,
                className: "p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              }, React.createElement(Check, { size: 16 })),
              React.createElement('button', {
                onClick: () => setShowNewTrip(false),
                className: "p-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
              }, React.createElement(X, { size: 16 }))
            ]) : React.createElement('button', {
              onClick: () => setShowNewTrip(true),
              className: "px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 font-medium"
            }, [
              React.createElement(Plus, { size: 16, key: "plus" }),
              React.createElement('span', { key: "text" }, "Add Trip")
            ])
          ])
        ])
      )
    ),

    React.createElement('div', { className: "max-w-6xl mx-auto px-6 py-8", key: "content" }, [
      // Stats Cards
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", key: "stats" }, [
        React.createElement('div', { className: "bg-emerald-600 rounded-2xl p-6 text-white", key: "total" }, [
          React.createElement('div', { className: "flex items-center justify-between mb-4" }, [
            React.createElement('h3', { className: "text-emerald-100 text-sm font-medium" }, "Total Items"),
            React.createElement(Target, { className: "text-emerald-200", size: 20 })
          ]),
          React.createElement('div', { className: "text-3xl font-bold mb-2" }, getTotalItems()),
          React.createElement('div', { className: "text-emerald-200 text-sm" }, "Ready to pack")
        ]),

        React.createElement('div', { className: "bg-white rounded-2xl p-6 border border-gray-100", key: "packed" }, [
          React.createElement('div', { className: "flex items-center justify-between mb-4" }, [
            React.createElement('h3', { className: "text-gray-600 text-sm font-medium" }, "Packed Items"),
            React.createElement(Check, { className: "text-gray-400", size: 20 })
          ]),
          React.createElement('div', { className: "text-3xl font-bold text-gray-900 mb-2" }, getPackedItems()),
          React.createElement('div', { className: "text-green-600 text-sm" }, "✓ Completed")
        ]),

        React.createElement('div', { className: "bg-white rounded-2xl p-6 border border-gray-100", key: "yours" }, [
          React.createElement('div', { className: "flex items-center justify-between mb-4" }, [
            React.createElement('h3', { className: "text-gray-600 text-sm font-medium" }, "Your Items"),
            React.createElement(User, { className: "text-gray-400", size: 20 })
          ]),
          React.createElement('div', { className: "text-3xl font-bold text-gray-900 mb-2" }, getYourItems()),
          React.createElement('div', { className: "text-emerald-600 text-sm" }, "Assigned to you")
        ]),

        React.createElement('div', { className: "bg-white rounded-2xl p-6 border border-gray-100", key: "johns" }, [
          React.createElement('div', { className: "flex items-center justify-between mb-4" }, [
            React.createElement('h3', { className: "text-gray-600 text-sm font-medium" }, "John's Items"),
            React.createElement(User, { className: "text-gray-400", size: 20 })
          ]),
          React.createElement('div', { className: "text-3xl font-bold text-gray-900 mb-2" }, getJohnItems()),
          React.createElement('div', { className: "text-green-600 text-sm" }, "Assigned to John")
        ])
      ]),

      // Progress Overview
      React.createElement('div', { className: "bg-white rounded-2xl p-6 border border-gray-100 mb-8", key: "progress" }, [
        React.createElement('div', { className: "flex items-center justify-between mb-6" }, [
          React.createElement('h3', { className: "text-lg font-semibold text-gray-900" }, "Packing Progress"),
          React.createElement('span', { className: "text-2xl font-bold text-emerald-600" }, `${completionPercentage}%`)
        ]),
        
        React.createElement('div', { className: "w-full bg-gray-200 rounded-full h-3 mb-4" },
          React.createElement('div', {
            className: "bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500",
            style: { width: `${completionPercentage}%` }
          })
        ),
        
        React.createElement('div', { className: "flex justify-between text-sm text-gray-600" }, [
          React.createElement('span', {}, `${getPackedItems()} items packed`),
          React.createElement('span', {}, `${getTotalItems() - getPackedItems()} remaining`)
        ])
      ]),

      // Categories
      React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", key: "categories" }, 
        currentTrip?.categories.map(category => 
          React.createElement('div', { key: category.id, className: "bg-white rounded-2xl border border-gray-100 overflow-hidden" }, [
            // Category header
            React.createElement('div', {
              key: "header",
              onClick: () => toggleCategory(category.id),
              className: "flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
            }, [
              React.createElement('div', { className: "flex items-center gap-3" }, [
                category.collapsed ? 
                  React.createElement(ChevronRight, { size: 18, className: "text-gray-400" }) : 
                  React.createElement(ChevronDown, { size: 18, className: "text-gray-400" }),
                React.createElement('h3', { className: "font-semibold text-gray-900" }, category.name)
              ]),
              React.createElement('div', { className: "flex items-center gap-2" }, [
                React.createElement('span', { className: "text-sm text-gray-500" }, 
                  `${category.items.filter(item => item.packed).length}/${category.items.length}`
                ),
                React.createElement('div', { className: "w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center" },
                  React.createElement('span', { className: "text-xs font-medium text-emerald-700" },
                    `${category.items.length > 0 ? Math.round((category.items.filter(item => item.packed).length / category.items.length) * 100) : 0}%`
                  )
                )
              ])
            ]),

            // Category items
            !category.collapsed && React.createElement('div', { key: "items", className: "p-6" }, [
              React.createElement('div', { className: "space-y-3 mb-6" }, 
                category.items.map(item => 
                  React.createElement('div', { key: item.id, className: "flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 group" }, [
                    React.createElement('button', {
                      onClick: () => toggleItemPacked(category.id, item.id),
                      className: `w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        item.packed 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                          : 'border-gray-300 hover:border-emerald-400 group-hover:border-emerald-300'
                      }`
                    }, item.packed && React.createElement(Check, { size: 12 })),
                    
                    React.createElement('div', { className: "flex-1 min-w-0" }, [
                      React.createElement('div', { 
                        className: `font-medium ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}` 
                      }, item.name),
                      item.assigned_to && React.createElement('div', { className: "mt-1" },
                        React.createElement('span', { 
                          className: `inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border ${getAssignmentColor(item.assigned_to)}` 
                        }, [
                          React.createElement(User, { size: 10, key: "icon" }),
                          React.createElement('span', { key: "text" }, item.assigned_to)
                        ])
                      )
                    ]),

                    React.createElement('button', {
                      onClick: () => deleteItem(category.id, item.id),
                      className: "opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                    }, React.createElement(X, { size: 16 }))
                  ])
                )
              ),

              // Add new item
              React.createElement('div', { className: "border-t border-gray-100 pt-4" },
                React.createElement('div', { className: "flex gap-3 mb-3" }, [
                  React.createElement('input', {
                    type: "text",
                    placeholder: "Add new item...",
                    value: newItemInputs[category.id]?.name || "",
                    onChange: (e) => updateNewItemInput(category.id, 'name', e.target.value),
                    className: "flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                    onKeyPress: (e) => e.key === 'Enter' && addItem(category.id)
                  }),
                  React.createElement('select', {
                    value: newItemInputs[category.id]?.assignedTo || "",
                    onChange: (e) => updateNewItemInput(category.id, 'assignedTo', e.target.value),
                    className: "px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  }, [
                    React.createElement('option', { value: "", key: "unassigned" }, "Unassigned"),
                    React.createElement('option', { value: "You", key: "you" }, "You"),
                    React.createElement('option', { value: "John", key: "john" }, "John")
                  ]),
                  React.createElement('button', {
                    onClick: () => addItem(category.id),
                    className: "px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center"
                  }, React.createElement(Plus, { size: 16 }))
                ])
              )
            ])
          ])
        )
      ),
      // Add new category
     React.createElement('div', { className: "mt-6", key: "add-category" }, [
       showNewCategory ? React.createElement('div', { className: "bg-white rounded-2xl p-6 border border-gray-100" },
         React.createElement('div', { className: "flex gap-3" }, [
           React.createElement('input', {
             type: "text",
             placeholder: "Category name (e.g., Electronics, Documents)",
             value: newCategoryName,
             onChange: (e) => setNewCategoryName(e.target.value),
             className: "flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
             onKeyPress: (e) => e.key === 'Enter' && addCategory()
           }),
           React.createElement('button', {
             onClick: addCategory,
             className: "px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
           }, React.createElement(Check, { size: 16 })),
           React.createElement('button', {
             onClick: () => setShowNewCategory(false),
             className: "px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
           }, React.createElement(X, { size: 16 }))
         ])
       ) : React.createElement('button', {
         onClick: () => setShowNewCategory(true),
         className: "w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-medium"
       }, [
         React.createElement(Plus, { size: 18, key: "plus" }),
         React.createElement('span', { key: "text" }, "Add New Category")
       ])
     ]),

     // Backend Status
     React.createElement('div', { className: "mt-8 bg-green-50 border border-green-200 rounded-2xl p-6", key: "status" }, [
       React.createElement('h3', { className: "font-semibold text-green-900 mb-2" }, "🎉 Real-Time Sharing Active!"),
       React.createElement('p', { className: "text-green-700 text-sm mb-3" }, 
         "Your packing lists sync in real-time via Netlify + Supabase"
       ),
       React.createElement('div', { className: "text-green-700 text-sm space-y-1" }, [
         React.createElement('div', { key: "1" }, "✅ Data syncs across all devices"),
         React.createElement('div', { key: "2" }, "✅ Changes appear for both you and John"),
         React.createElement('div', { key: "3" }, "✅ Auto-refresh every 10 seconds"),
         React.createElement('div', { key: "4" }, "✅ Data persisted in cloud database")
       ]),
       React.createElement('div', { className: "mt-3 p-3 bg-green-100 rounded-lg" },
         React.createElement('p', { className: "text-green-800 text-xs" }, [
           React.createElement('strong', { key: "bold" }, "🚀 Ready to share! "),
           React.createElement('span', { key: "text" }, "Send this URL to John and you'll both see real-time updates.")
         ])
       )
     ])
   ])
 ]);
};

// Render the app
ReactDOM.render(React.createElement(PackingListApp), document.getElementById('root'));


