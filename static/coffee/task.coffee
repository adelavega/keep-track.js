instructions = ["
In this task, you'll see one word at a time from various categories.<br><br>
Your job will be to remember the last word from specific categories. <br><br>

Let's see how it works!"

"The words you'll see belong to six categories.<br>
Take a second to familiarize yourself with them. "

"You'll be told which categories to keep track of before you see the words. <br><br>
For example, you may be asked to keep track of <i>only</i> 'Colors' and 'Animals'.<br><br>

In this case, you'll want to ignore words from other categories, like 'Countries.'"

"You'll always see on the screen the category names you should keep track of.<br><br>
Above the categories you'll see one word at a time for about 2 seconds each.<br><br>
Let's see an example."

"For this example, we're going to slow everything down to make it easier to understand.<br><br>
You'll be keeping track of <strong>'Animals'</strong> and <strong>'Relatives'</strong>. <br><br>Only keep track of the <i>last</i> word from each of these categories.<br><br>
Click start to begin! 
"

"The last Animal word was 'Cat' and the last Relative was 'Aunt'.  <br><br>
Is that what you saw?<br><br> If you are confused watch that again, otherwise let's learn how to input your responses."

"You'll see a grid with all of the possible words in the categories you were asked to keep track of, like this:<br><br><br><br><br>

To respond, just click on the word you thought was the last of each category. "

"Try entering, 'Cat' and 'Aunt', the correct answer of the example"

"Good job. Notice how once you entered an answer, the other words in that category became disabled. 
<br><br>Let's do a longer example, this time at full speed.<br><br>
Remember to pay attention to the categories and only keep track of the <i>last</i> 
item from each category"

"Great! You're done with the practice"

]

## psychTask.cs utilities
## Various small functions to calculate values, 
## display text and images, update and dislay buttons etc...
## Also sets up canvas


## Set up PsiTurk and preload the pages that will be shown after task is done
psiTurk = PsiTurk(uniqueId, adServerLoc)
psiTurk.preloadPages(['postquestionnaire.html', 'debriefing.html'])

# Calculates the mean of a numeric array (for feedback)
mean = (numericArray) ->
	sum = numericArray.reduce((a, b) -> a + b)
	avg = sum / numericArray.length

	return avg

# Hides left and right buttons
hideButtons = ->
	$("#leftButton").hide()
	$("#rightButton").hide()

# Sets the text of left and right buttoms
keyText = (text, key) ->
	if key is 'left'
		$("#leftText").html(text)
		$("#leftButton").show()
	else
		$("#rightText").html(text)
		$("#rightButton").show()

fillGrid = (cats) ->
	clearGrid()
	$('.btn-group').parent().addClass('hidden') # Hide irrelevant ones


	# Show again
	$('#responses').show().removeClass('hidden')

	i = 1
	for cat in cats
		cdiv = "#c" + i.toString()
		filt = cdiv + ' > button'

		$(cdiv).parent().removeClass('hidden')
		$(cdiv).prev().html(cat + "&nbsp&nbsp")

		x = 0
		$(filt).each ->
			$(this).html(categories[cat][x])
			x = x + 1
		i = i + 1

closeGrid = (func) ->
	$('#responses').fadeOut()
	setTimeout (=> 
		func()
	) , 1000

clearGrid = ->
	# Reset grid before showing again
	$('.resp').removeClass('btn-primary')


## psychTask.cs generic task
## This is where most of your task goes
## Categories, Last words, All words

all_stim = {"pracLists": [[["Relatives", "Animals"], ["Aunt", "Cat"], ["Horse", "Mile", "Steel", "Cat", "Meter", "Green", "Aunt"]]
, [["Metals", "Countries", "Distances", "Colors"], ["Steel", "Mexico", "Yard", "Green"], ["Red" ,"Blue" ,"Tin" ,"Cow" ,"Yellow" ,"England" ,"Lion" ,"Meter" ,"Inch" ,"Mexico" ,"Black" ,"Brother" ,"Green" ,"Cat" ,"Yard" ,"Aunt" ,"Uncle" ,"Steel" ,"Horse" ,"Father"]]]}


categories = {"Animals": ["Dog", "Cat", "Tiger", "Horse", "Lion", "Cow"], "Relatives": ["Sister", "Mother", "Brother", "Aunt", "Father", "Uncle"], "Distances" :["Mile", "Centimeter", "Inch", "Foot", "Meter", "Yard"], "Countries" :["Germany", "Russia", "Canada", "France", "England", "Mexico"], "Metals" :["Zinc", "Tin", "Steel", "Iron", "Copper", "Platinum"], "Colors" :["Red", "Green", "Blue", "Yellow", "Black", "Orange"]}

all_cats = ['Distances', 'Relatives', 'Animals', 'Countries', 'Metals', 'Colors']

# Some global variables
stimLength = 2000

## Global session class
## Iterates through blocks and other events such as instructions
class Session
	constructor: (@blocks) ->
		hideButtons()
		@blockNumber = 0
		@max_blocks = @blocks.length
		@imgs_loaded = 0
		
	start: ->
		psiTurk.finishInstructions()

		# This ensures that the images for the two buttons are loaded
		# Could probably be done better
		@imgs_loaded++
		if @imgs_loaded is 2
			@nextBlock()

	# Go to next block
	nextBlock: ->
		@currBlock = @blocks[@blockNumber]
		if @blockNumber >= @max_blocks
			@endSession()
		else
			@blockNumber++

			# Start the next block
			# When block ends, call exitBlock with argument
			# Argument is whether to continue or go back (instructions)
			$('.tasktext').html(' ')
			@currBlock.start ((arg1) => @exitBlock arg1)

	# Go back a block	
	prevBlock: ->
		if @blockNumber > 1
			@blockNumber = @blockNumber - 2

		@currBlock = @blocks[@blockNumber]

		@blockNumber++
		@currBlock.start ((arg1) => @exitBlock arg1)

	# This gets called when block is over.
	# Saves data and goes back or forward
	exitBlock: (next = true) ->
		# psiTurk.saveData()
		if next
			@nextBlock()
		else
			@prevBlock()
	
	# Ends it all
	endSession: ->
		psiTurk.completeHIT()
		

	# Handles button clocks (mostly for questionnaires)
	buttonClick: (e) ->
		@currBlock.buttonClick(e)

## Instruction block
## Will display instructions in @message, and set left and right buttons to said text
## Can optionally take a correct response (if incorrect, will not allow you to advance) & button colors
class Instruction
	constructor: (@message, @leftKey = null, @rightKey = "Continue", @corrResp = null) ->

	# Called by Session. Given exit function
	# Starts timer, displays text, and displays buttons that are not null
	start: (@exitTrial) ->
		@startTime = (new Date).getTime()
		$('#inst').html(@message)
		$('#inst').show()
		
		hideButtons()
		if @leftKey?
			keyText(@leftKey, 'left')

		## Show key picture and text next to it
		keyText(@rightKey, 'right')

	# Record RT, check if response is correct (if applicable), and 
	buttonClick: (button) ->
		rt = (new Date).getTime() - @startTime

		if @corrResp?
			if @corrResp is button
				$('#correct').modal('show')
				setTimeout (=> $('#correct').modal('hide')), 1250
				setTimeout (=> @exitTrial()), 1250
				acc = 1
			else
			## Show incorrect message
				$('#error').modal('show')
				setTimeout (=> $('#error').modal('hide')), 1250
				acc = 0
		else # If there is no correct answer, just record what was pressed
			if button.id is 'leftText' or button.id is 'leftButton'
				acc = 'BACK'
				@exitTrial false
			else if button.id is 'rightText' or button.id is 'rightButton'
				acc = 'FORWARD'
				@exitTrial()

		psiTurk.recordTrialData({'block': @message, 'rt': rt, 'resp': button, 'acc': acc})

class InstGrid
	constructor: (@message, @categories=all_cats, @disabled=true, @correct=false, @leftKey = "Back", @rightKey = "Continue") ->
		@maxClicks = @correct.length
		console.log(@correct.length)


	start: (@exitTrial) ->
		fillGrid(@categories)

		$('#inst').html(@message)
		$('#inst').show()

		hideButtons()
		if @leftKey
			console.log(@leftKey)
			keyText(@leftKey, 'left')

		if @rightKey
			keyText(@rightKey, 'right')

		if @correct != false
			keyText('Submit', 'right')
			$('#rightButton').addClass('disabled')
			$('#rightButton').removeClass('btn-success')

	reset: ->
		clearGrid()

	buttonClick: (button) ->
		if button.id is 'leftText' or button.id is 'leftButton'
			closeGrid(@exitTrial false)
		else if button.id is 'rightText' or button.id is 'rightButton'
			if not @correct
				closeGrid(@exitTrial)
			else
				@checkResponses()
		else  
			if not @disabled
				$(button).siblings().removeClass('btn-primary')
				$(button).toggleClass('btn-primary')

			if $('.resp.btn-primary').length == @maxClicks
				$('#rightButton').removeClass('disabled')
				$('#rightButton').addClass('btn-success')
			else if $('.resp.btn-primary').length != @maxClicks
				$('#rightButton').addClass('disabled')
				$('#rightButton').removeClass('btn-success')


	checkResponses: ->
		responses = $('.resp.btn-primary').map( ->
                 $(this).text()
              ).get()

		# Check if all respones are correct
		# Otherwise complain and reset
		allCorr = true
		for resp in responses
			if resp in @correct == false
				allCorr = false

		if allCorr
			closeGrid(@exitTrial)
			$('#correct').modal('show')
			setTimeout (=> $('#correct').modal('hide')), 1250

		else
			@showError()

	showError: ->
			$('#error').modal('show')
			setTimeout (=> $('#error').modal('hide')), 1250

class Block
	constructor: (@condition, @message, trial_structure) ->
		@trialNumber = 0
		@categories = trial_structure[0]
		@target_words = trial_structure[1]
		@words = (new Word(word) for word in trial_structure[2])
		@max_trials = @words.length
		@catText = @categories.join("&nbsp&nbsp")

	# When block starts, hide buttons, show message, and after IBI start first trial
	start: (@exitBlock) ->
		# Show ready message
		hideButtons()
		$('#topText').html(@message)

		setTimeout (=> 
			$('#topText').html(" ")
			$('#bottomText').html(@catText)
			setTimeout (=>
				@nextTrial()), stimLength
		) ,stimLength

	nextTrial: ->
		@currTrial = @words[@trialNumber]
		if @trialNumber >= @max_trials
			@trialNumber++
			@getResponses()
		else
			@trialNumber++
			@currTrial.show (=> @nextTrial())

	getResponses: ->
		$('#bottomText').html(" ")
		$('#topText').html(" ")
		$('#inst').html("Please enter the last word of each category")

		fillGrid(@categories)
		@maxClicks = @categories.length
		@clicks = 0


	buttonClick: (button) ->
		@clicks = @clicks + 1

		$(button).siblings().removeClass('btn-primary').addClass('disabled')
		$(button).toggleClass('btn-primary').addClass('disabled')

		if @clicks == @maxClicks
			## Collect data and send to psiTurk
			closeGrid(@exitBlock)
		psiTurk.recordTrialData({'block': @condition, 'target_words': @target_words, 'input_words': @data})

	
class PracBlock extends Block
	constructor: (@condition, @message, trial_structure, speed=3500) ->
		super @condition, @message, trial_structure
		@words = (new Word(word, speed) for word in trial_structure[2])
	getResponses: ->
		$('#bottomText').html(" ")
		$('#topText').html(" ")
		@exitBlock()


# A word class. Shows a word, and waits two seconds. 
class Word
	constructor: (@word, @stimLength=stimLength) ->

	show: (@exitTrial)  ->
		$('#topText').html(@word)

		setTimeout (=> @exitTrial()), @stimLength


# This class simply displays the post questionnaire and 
# collects information from it once button is clocked
class Questionnaire
	start: (@exitTrial) ->
		$('body').html(psiTurk.getPage('postquestionnaire.html'))

	buttonClick: ->
		$("select").each (i, val) ->
		  psiTurk.recordUnstructuredData @id, @value
		  console.log([@id, @value])

		psiTurk.recordUnstructuredData 'openended', $('#openended').val()

		@exitTrial()

# Displays debriefing and when button is clicked ends
class Debriefing
	start: (@exitTrial) ->
		$('body').html(psiTurk.getPage('debriefing.html'))

	buttonClick: ->
		@exitTrial()		

# jQuery call to set key and click handlers
jQuery ->
	$("body").on('click','button', (event) ->
		currSession.buttonClick(event.target))
	currSession.start()

# This is where you set the order of your blocks
# Simply an array that will get passed down to the Session
blocks = [
	new Instruction instructions[0]
	new InstGrid instructions[1]
	new Instruction instructions[2]
	new Instruction instructions[3]
	new Instruction instructions[4], "Back", "Start!"
	new PracBlock "prac1", "Ready?", all_stim['pracLists'][0]
	new Instruction instructions[5], "See again", "Continue"
	new InstGrid instructions[6], all_cats, true, false
	new InstGrid instructions[7], all_cats, false, ['Aunt', 'Cat'], false, false
	new Instruction instructions[8], null, "Start"
	new PracBlock "prac1", "Ready?", all_stim['pracLists'][1], 2000
	new InstGrid "Please enter the last word of each category", all_cats, false, all_stim['pracLists'][1][1], false, false
	new Instruction instructions[9]
	
	new Questionnaire
	new Debriefing
]

## These have to be at the bottom
# Create the session with block array above
currSession = new Session(blocks)

currSession.start()