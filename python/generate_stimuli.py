import random
import pandas as pd
import os
import json
from os import makedirs
from os.path import exists

"""" Counterbalancing rules (per Naomi):

Most important: 
Each category used equally often as target. 
each word used equally often as a target and distractor; each word also equally often as a final word.

Additionally, I tried to have variability in which categories appear together (e.g., animals not always with countries). 

There are systematic things about the lists: 
With 3 categories, one has 1 target, one has 2, and one has 3. When there are 4 categories, the extra one can have any of those #s in it (tried to equate). When there are only 2, select from those #s evenly across trials (see the spreadsheet you have). 
The last word in the trial is never a relevant word; looks like the first word can be relevant, but never is the final word for a category (though that may have been unintentional). 
target words do not repeat across adjacent trials
final words cannot repeat across adjacent trials
distactors *can* repeat across adjacent trials
distractors in one trial *can* be the same as target words in adjacent trials

"""

categories = {"Animals": ["Dog", "Cat", "Tiger", "Horse", "Lion", "Cow"], "Relatives": ["Sister", "Mother", "Brother", "Aunt", "Father", "Uncle"], "Distances": ["Mile", "Centimeter", "Inch", "Foot", "Meter", "Yard"], "Countries": [
    "Germany", "Russia", "Canada", "France", "England", "Mexico"], "Metals": ["Zinc", "Tin", "Steel", "Iron", "Copper", "Platinum"], "Colors": ["Red", "Green", "Blue", "Yellow", "Black", "Orange"]}

class StimGen():
	def __init__(self, categories, num_targets, len_lists = 15):
		""" Keep track task stimuli generator. Provide the following:
		categories: a dictionary of category names and items
		num_targets: a list of the number of targets in each trial. 
		len_lists: How long each trial should be.
		"""

		self.total_categories = categories.keys() * (sum(num_targets) / len(categories))
		self.categories = categories
		self.num_targets = num_targets
		self.len_lists = len_lists

		if sum(num_targets) % len(categories) != 0:
		    print 'Number of targets, ' + str(sum(num_targets)) + ' must be divisible by number of categories, ' + str(len(categories)) + ', for each category to be used as a target equally.'

		random.shuffle(num_targets)

		# Start with the easiest category always
		while(num_targets[0] != pd.DataFrame(self.num_targets).min()[0]):
			random.shuffle(num_targets)


	def _select_trial_types(self):
		## Select trial types
		import copy
		cats = copy.deepcopy(self.total_categories)

		self.trial_types = []
		for n_t in self.num_targets:
			this_trial = []
			for category in cats:
				if not category in this_trial:
					this_trial.append(category)

				if len(this_trial) == n_t:
					[cats.pop(cats.index(item)) for item in this_trial]
					self.trial_types.append(this_trial)
					break

	def _choose_targets(self, trial_cats, last_targets = []):
		trial_targets = []

		if len(trial_cats) == 5:
			choose_cats = [trial_cats[0]] + [trial_cats[1]] *2 + [trial_cats[2]] * 2 + [trial_cats[3]] * 3 + [trial_cats[4]] * 3

		# Set how many to choose from each category
		elif len(trial_cats) > 2:
			choose_cats = [trial_cats[0]] + [trial_cats[1]] *2 + [trial_cats[2]] * 3

			if len(trial_cats) >3:
				n_last = random.choice([1, 2, 3])
				choose_cats += [trial_cats[3]] * n_last
		
		# Choose stimuli for each cateogry
		for cat in choose_cats:
			# Try stimuli that have no been distractors first, up to those that have been distractors 10 times
			found = False
			for num_reps in range(self.max_reps):
				# Stim that have been distractors n times, and are in the category
				avail_stim = self.target_dist_count[(self.target_dist_count.Words.isin(categories[cat])) & (self.target_dist_count.Target == num_reps)]
				if len(avail_stim) > 0:
					# Choose random stim
					stim = random.choice(list(avail_stim.Words))
					max_i = len(avail_stim.Words)
					i = 0

					while (i < max_i) and (stim in trial_targets or stim in last_targets):
						stim = random.choice(list(avail_stim.Words))
						i+= 1
					# Only save if while loop exited from meeting stimuli conditions
					if i < max_i:
						trial_targets.append(stim)
						found = True
						self.target_dist_count.ix[self.target_dist_count.Words == stim, 'Target'] += 1
						break
			if not found:
				raise Exception("Couldn't find Target")

		return trial_targets

	def _order_stim(self, trial_cats, targets, last_targets=[]):
		## Words that are in the current cateogories, and thus can't be distractors
		words_not = [item for sublist in [categories[key] for key in categories.keys() if key in trial_cats] for item in sublist]

		random_distractors = []
		for x in range(self.len_lists - len(targets) + 1):
			found = False

			for num_reps in range(self.max_reps):
				avail_stim = self.target_dist_count[(self.target_dist_count.Words.isin(words_not) == False) & (self.target_dist_count.Distractor < num_reps)]
				if len(avail_stim) > 0:
					stim = random.choice(list(avail_stim.Words))
					max_i = len(avail_stim.Words)
					i = 0

					while (i < max_i) and (stim in targets or stim in random_distractors):
						stim = random.choice(list(avail_stim.Words))
						i+= 1
					# Only save if while loop exited from meeting stimuli conditions
					if i < max_i:
						random_distractors.append(stim)
						found = True
						self.target_dist_count.ix[self.target_dist_count.Words == stim, 'Distractor'] += 1
						break
			if not found:
				raise Exception("Couldn't find Distractor")

	 	# Random sequence + last one must be a distractor
		sequence = random.sample(targets + random_distractors[1:-1], len(targets + random_distractors[1:-1])) + [random_distractors[-1]]

		# Make sure last word is not the same as last
		if last_targets:
			while (sequence[-1] == last_targets[-1]) or (int(self.target_dist_count[self.target_dist_count.Words == sequence[-1]].Last) > 0) :
				random.shuffle(random_distractors)
				sequence = random.sample(targets + random_distractors[1:-1], len(targets + random_distractors[1:-1])) + [random_distractors[-1]]

		self.target_dist_count.ix[self.target_dist_count.Words == sequence[-1], 'Last'] += 1

		 
		return sequence, {cat : filter(lambda x: x in categories[cat], sequence)[-1] for cat in trial_cats}


	def generate_stim(self, max_reps):
		""" Run this to generate the stimuli"""

		## Put it all together
		self.all_targets = []
		self.all_stimuli = []
		self.all_correct = []
		self.last_targets = []
		self.target_dist_count = pd.DataFrame({'Words': [item for sublist in [categories[cat] for cat in categories] for item in sublist], 'Distractor' : 0, 'Target': 0, 'Last': 0})

		self.max_reps = max_reps

		self._select_trial_types()

		for i, trial in enumerate(self.trial_types):
			if i == 0:
				last_targets = []
			else:
				last_targets = self.all_targets[i-1]

			target_words = self._choose_targets(trial, last_targets)
			all_stim, correct = self._order_stim(trial, target_words, last_targets=last_targets)

			self.all_targets.append(target_words)
			self.all_stimuli.append(all_stim)
			self.all_correct.append(correct)
			self.last_targets.append([filter(lambda x: x in categories[cat], all_stim)[-1] for cat in trial])

	def save(self, out_dir = '../static/stimuli'):
		if not exists(out_dir):
			makedirs(out_dir)

		js_data = []
		for i, trial in enumerate(self.trial_types):
			js_data.append([trial, self.last_targets[i], self.all_stimuli[i]])

		json.dump(js_data, open(os.path.join(out_dir, 'stim.txt'), 'w'))

		# Make last word upper case for csv
		csv_all_stim = [[word.upper() if word in self.last_targets[n] else word for word in stim] for n, stim in enumerate(self.all_stimuli)]


		pd.DataFrame(csv_all_stim).T.to_csv(os.path.join(out_dir, 'stimuli.csv'))
		pd.DataFrame(self.last_targets).T.to_csv(os.path.join(out_dir, 'last_targets.csv'))
		pd.DataFrame(self.all_targets).T.to_csv(os.path.join(out_dir, 'all_targets.csv'))
		pd.DataFrame(self.trial_types).T.to_csv(os.path.join(out_dir, 'categories.csv'))
		pd.DataFrame(self.target_dist_count).to_csv(os.path.join(out_dir, 'counts.csv'))








