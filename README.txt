	1.A "Sort By" dropdown: 
		Lets the user sort the search results by many different ways including
		by lowest price, highest price, newest to oldest release date, oldest to newest release date, artist
		name, and collection name. All these options are hardcoded. Since it's a dropdown, only one option can be selected at once 		   (i.e. can't sort by multiple critera). When the user makes a search, the search results are ordered the default 
		way(i.e how it comes from the iTunes API).
	
	2.Additional tab for each search result that lists all songs in a collection:
		This additional tab called "Songs" is next to the "Artist Infor." tab for each result. This
		songs tab shows all the songs in a collection when the user clicks on the tab.
	
	3.Checkboxes to filter by range:
		Under the "Refine By:" heading there are several checkboxes to filter by price ranges. The price ranges
		for the checkboxes are "Under $5", "$5-$10", "$10-$15", "$15-$20", and "Over $20" with all these
		ranges being hardcoded. Since these are checkboxes, the user can filter by multiple discrete ranges such as
		from $10-$15 and over $20. By default, none of the checkboxes are selected when the user makes a search.
		Lastly, the number in parentheses to the right of each range option is the number of search results that 
		are in that price range. 
	
	4.Radio buttons for explicitness
		Under the "Refine By:" heading there are 3 radio buttons to filter by explicitness. Since these are 
		radio buttons, the options are mutually exclusive. Clicking on the "Explicit" radio button
		shows only the search results with explicit content and likewise by clicking "Non-Explicit".
		By default, all the search results are shown regardless of explicitness.
		
	5.Checkboxes to filter by artist name
		Under the "Refine By:" heading there are checkboxes to filter by artist name. These checkboxes are
		dynamically created after every search result. These checkboxes also show the number of search results that
		match a particular artist name in parentheses. 
