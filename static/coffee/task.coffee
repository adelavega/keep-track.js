## Set up PsiTurk and preload the pages that will be shown after task is done
psiTurk = PsiTurk(uniqueId, adServerLoc)
psiTurk.preloadPages(['postquestionnaire.html', 'debriefing.html'])

@psiTurk = psiTurk

# jQuery call to set key and click handlers
jQuery ->
	$("body").on('click','button', (event) ->
		currSession.buttonClick(event.target))
	currSession.start()

# This is where you set the order of your blocks
# Simply an array that will get passed down to the Session
blocks = [
	# new kTrack.Instruction kTrack.instructions[0]
	# new kTrack.InstGrid kTrack.instructions[1]
	# new kTrack.Instruction kTrack.instructions[2]
	# new kTrack.Instruction kTrack.instructions[3]
	# new kTrack.Instruction kTrack.instructions[4], "Back", "Start!"
	# new kTrack.PracBlock "prac1", "Ready?", kTrack.all_stim['pracLists'][0]
	# new kTrack.Instruction kTrack.instructions[5], "See again", "Continue" ## Change instructions
	# new kTrack.InstGrid kTrack.instructions[6], kTrack.all_cats, true, false
	new kTrack.InstGrid kTrack.instructions[7], kTrack.all_cats, false, ['Aunt', 'Cat'], false, false
	new kTrack.Instruction kTrack.instructions[8], null, "Start"
	new kTrack.PracBlock "prac1", "Ready?", kTrack.all_stim['pracLists'][1], 2000
	new kTrack.InstGrid "Please enter the last word of each category", kTrack.all_cats, false, kTrack.all_stim['pracLists'][1][1], false, false
	new kTrack.Instruction kTrack.instructions[9]
	
	# new Questionnaire
	# new Debriefing
]

## These have to be at the bottom
# Create the session with block array above
currSession = new kTrack.Session(blocks)

currSession.start()