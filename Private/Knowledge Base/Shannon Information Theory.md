# Shannon Information Theory

**Type**: Mathematical Theory  
**Domain**: Information Science & Communications  
**Origin**: Claude Shannon (1948)  
**Foundation**: "A Mathematical Theory of Communication"  
**Context**: Quantitative measurement of information, entropy, and communication

## Overview

Shannon Information Theory, developed by Claude Shannon at Bell Labs in 1948, provides a mathematical framework for quantifying information, measuring uncertainty, and analyzing communication systems. It forms the theoretical foundation for digital communications, data compression, cryptography, and modern computing.

## Core Concept

> "Information is the resolution of uncertainty."

Shannon defined information not by its meaning, but by its ability to reduce uncertainty. The more unexpected an event, the more information it conveys when it occurs.

## Mathematical Foundation

### Information Content

The information content of an event is inversely related to its probability:

```python
import math

def information_content(probability):
    """Calculate information content in bits"""
    if probability <= 0 or probability > 1:
        raise ValueError("Probability must be between 0 and 1")
    return -math.log2(probability)

# Examples
print(f"Fair coin flip: {information_content(0.5):.2f} bits")  # 1.00 bits
print(f"Rare event (1%): {information_content(0.01):.2f} bits")  # 6.64 bits
print(f"Certain event: {information_content(1.0):.2f} bits")  # 0.00 bits
```

### Shannon Entropy

Entropy measures the average information content of a message source:

```python
def shannon_entropy(probabilities):
    """Calculate Shannon entropy of a probability distribution"""
    entropy = 0
    for p in probabilities:
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy

class InformationSource:
    def __init__(self, symbols, probabilities):
        self.symbols = symbols
        self.probabilities = probabilities
        self.entropy = shannon_entropy(probabilities)
    
    def average_information(self):
        """Average information per symbol"""
        return self.entropy
    
    def max_entropy(self):
        """Maximum possible entropy (uniform distribution)"""
        return math.log2(len(self.symbols))
    
    def redundancy(self):
        """Measure of predictability (1 - efficiency)"""
        return 1 - (self.entropy / self.max_entropy())

# Example: English alphabet analysis
english_freq = [0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 
                0.02015, 0.06094, 0.06966, 0.00153, 0.00772, 0.04025,
                0.02406, 0.06749, 0.07507, 0.01929, 0.00095, 0.05987,
                0.06327, 0.09056, 0.02758, 0.00978, 0.02360, 0.00150,
                0.01974, 0.00074]

english_source = InformationSource(
    symbols=list('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    probabilities=english_freq
)

print(f"English entropy: {english_source.entropy:.2f} bits/symbol")
print(f"Maximum entropy: {english_source.max_entropy():.2f} bits/symbol")
print(f"English redundancy: {english_source.redundancy():.2%}")
```

### Mutual Information

Mutual information measures the amount of information shared between two variables:

```python
def mutual_information(joint_prob, marginal_x, marginal_y):
    """Calculate mutual information between X and Y"""
    mi = 0
    for i in range(len(marginal_x)):
        for j in range(len(marginal_y)):
            if joint_prob[i][j] > 0:
                mi += joint_prob[i][j] * math.log2(
                    joint_prob[i][j] / (marginal_x[i] * marginal_y[j])
                )
    return mi

class InformationChannel:
    def __init__(self, input_probs, transition_matrix):
        self.input_probs = input_probs
        self.transition_matrix = transition_matrix
        self.calculate_channel_properties()
    
    def calculate_channel_properties(self):
        """Calculate channel capacity and other properties"""
        # Calculate output probabilities
        self.output_probs = []
        for j in range(len(self.transition_matrix[0])):
            output_prob = sum(
                self.input_probs[i] * self.transition_matrix[i][j]
                for i in range(len(self.input_probs))
            )
            self.output_probs.append(output_prob)
        
        # Calculate joint probabilities
        self.joint_probs = []
        for i in range(len(self.input_probs)):
            row = []
            for j in range(len(self.output_probs)):
                joint = self.input_probs[i] * self.transition_matrix[i][j]
                row.append(joint)
            self.joint_probs.append(row)
    
    def channel_capacity(self):
        """Calculate channel capacity in bits"""
        return mutual_information(
            self.joint_probs, 
            self.input_probs, 
            self.output_probs
        )
    
    def input_entropy(self):
        return shannon_entropy(self.input_probs)
    
    def output_entropy(self):
        return shannon_entropy(self.output_probs)
```

## Communication Theory

### Noisy Channel Model

Shannon's fundamental model of communication:

```
Information → Encoder → Channel → Decoder → Received Information
Source              (+ Noise)             
```

```python
class NoisyChannel:
    def __init__(self, error_rate):
        self.error_rate = error_rate
        self.correct_rate = 1 - error_rate
    
    def transmit_bit(self, bit):
        """Transmit a bit through noisy channel"""
        import random
        if random.random() < self.error_rate:
            return 1 - bit  # Flip bit
        return bit
    
    def capacity(self):
        """Calculate channel capacity (bits per transmission)"""
        if self.error_rate == 0.5:
            return 0  # No information can be reliably transmitted
        
        # Binary symmetric channel capacity
        h_p = shannon_entropy([self.error_rate, self.correct_rate])
        return 1 - h_p

# Example: Binary Symmetric Channel
bsc = NoisyChannel(error_rate=0.1)
print(f"Channel capacity: {bsc.capacity():.3f} bits per transmission")
```

### Error-Correcting Codes

Shannon showed that reliable communication is possible even over noisy channels:

```python
class HammingCode:
    """Simple error-correcting code implementation"""
    
    def __init__(self):
        # Hamming(7,4) code generator matrix
        self.generator = [
            [1, 1, 0, 1],
            [1, 0, 1, 1], 
            [1, 0, 0, 0],
            [0, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]
        
        # Parity check matrix
        self.parity_check = [
            [1, 0, 1, 0, 1, 0, 1],
            [0, 1, 1, 0, 0, 1, 1], 
            [0, 0, 0, 1, 1, 1, 1]
        ]
    
    def encode(self, data_bits):
        """Encode 4 data bits into 7-bit codeword"""
        if len(data_bits) != 4:
            raise ValueError("Data must be 4 bits")
        
        codeword = []
        for row in self.generator:
            bit = sum(data_bits[i] * row[i] for i in range(4)) % 2
            codeword.append(bit)
        
        return codeword
    
    def decode(self, received_bits):
        """Decode and correct single-bit errors"""
        if len(received_bits) != 7:
            raise ValueError("Received bits must be 7 bits")
        
        # Calculate syndrome
        syndrome = []
        for row in self.parity_check:
            bit = sum(received_bits[i] * row[i] for i in range(7)) % 2
            syndrome.append(bit)
        
        # Check for errors
        error_position = syndrome[0] + syndrome[1] * 2 + syndrome[2] * 4
        
        if error_position != 0:
            # Correct single-bit error
            corrected = received_bits.copy()
            corrected[error_position - 1] = 1 - corrected[error_position - 1]
            print(f"Error detected at position {error_position}, corrected")
            received_bits = corrected
        
        # Extract data bits (positions 2, 4, 5, 6)
        return [received_bits[2], received_bits[4], received_bits[5], received_bits[6]]

# Example usage
hamming = HammingCode()
data = [1, 0, 1, 1]
encoded = hamming.encode(data)
print(f"Original data: {data}")
print(f"Encoded: {encoded}")

# Simulate transmission with error
received = encoded.copy()
received[1] = 1 - received[1]  # Introduce error
print(f"Received (with error): {received}")

decoded = hamming.decode(received)
print(f"Decoded: {decoded}")
```

## Data Compression

### Huffman Coding

Optimal prefix-free codes based on symbol frequencies:

```python
import heapq
from collections import Counter, defaultdict

class HuffmanNode:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None
    
    def __lt__(self, other):
        return self.freq < other.freq

class HuffmanCoding:
    def __init__(self):
        self.codes = {}
        self.reverse_codes = {}
    
    def build_frequency_table(self, text):
        """Build frequency table from text"""
        return Counter(text)
    
    def build_huffman_tree(self, freq_table):
        """Build Huffman tree from frequency table"""
        heap = []
        
        # Create leaf nodes
        for char, freq in freq_table.items():
            node = HuffmanNode(char, freq)
            heapq.heappush(heap, node)
        
        # Build tree bottom-up
        while len(heap) > 1:
            node1 = heapq.heappop(heap)
            node2 = heapq.heappop(heap)
            
            merged = HuffmanNode(None, node1.freq + node2.freq)
            merged.left = node1
            merged.right = node2
            
            heapq.heappush(heap, merged)
        
        return heap[0] if heap else None
    
    def build_codes(self, root):
        """Generate Huffman codes from tree"""
        if not root:
            return
        
        def generate_codes(node, code=""):
            if node.char is not None:  # Leaf node
                self.codes[node.char] = code or "0"  # Handle single character
                self.reverse_codes[code or "0"] = node.char
            else:
                generate_codes(node.left, code + "0")
                generate_codes(node.right, code + "1")
        
        generate_codes(root)
    
    def encode(self, text):
        """Encode text using Huffman coding"""
        if not text:
            return ""
        
        freq_table = self.build_frequency_table(text)
        root = self.build_huffman_tree(freq_table)
        self.build_codes(root)
        
        encoded = ""
        for char in text:
            encoded += self.codes[char]
        
        return encoded
    
    def decode(self, encoded_text):
        """Decode Huffman-encoded text"""
        decoded = ""
        current_code = ""
        
        for bit in encoded_text:
            current_code += bit
            if current_code in self.reverse_codes:
                decoded += self.reverse_codes[current_code]
                current_code = ""
        
        return decoded
    
    def compression_ratio(self, original_text, encoded_text):
        """Calculate compression ratio"""
        original_bits = len(original_text) * 8  # Assuming ASCII
        compressed_bits = len(encoded_text)
        return original_bits / compressed_bits

# Example usage
text = "this is an example of huffman coding"
huffman = HuffmanCoding()

encoded = huffman.encode(text)
decoded = huffman.decode(encoded)

print(f"Original: '{text}'")
print(f"Encoded: {encoded}")
print(f"Decoded: '{decoded}'")
print(f"Compression ratio: {huffman.compression_ratio(text, encoded):.2f}")
print(f"Codes: {huffman.codes}")
```

### Lempel-Ziv Compression

Dictionary-based compression algorithm:

```python
class LZ77:
    """LZ77 compression algorithm"""
    
    def __init__(self, window_size=20, lookahead_size=15):
        self.window_size = window_size
        self.lookahead_size = lookahead_size
    
    def compress(self, text):
        """Compress text using LZ77"""
        compressed = []
        i = 0
        
        while i < len(text):
            # Define search window
            window_start = max(0, i - self.window_size)
            window = text[window_start:i]
            
            # Define lookahead buffer
            lookahead = text[i:i + self.lookahead_size]
            
            # Find longest match in window
            best_match = (0, 0, text[i] if i < len(text) else '')
            
            for j in range(len(window)):
                match_length = 0
                while (match_length < len(lookahead) and
                       match_length < len(window) - j and
                       window[j + match_length] == lookahead[match_length]):
                    match_length += 1
                
                if match_length > best_match[1]:
                    distance = len(window) - j
                    next_char = lookahead[match_length] if match_length < len(lookahead) else ''
                    best_match = (distance, match_length, next_char)
            
            compressed.append(best_match)
            i += max(1, best_match[1] + (1 if best_match[2] else 0))
        
        return compressed
    
    def decompress(self, compressed):
        """Decompress LZ77-compressed data"""
        text = ""
        
        for distance, length, next_char in compressed:
            if length > 0:
                start = len(text) - distance
                for i in range(length):
                    text += text[start + i]
            
            if next_char:
                text += next_char
        
        return text

# Example usage
lz77 = LZ77()
text = "abracadabra"
compressed = lz77.compress(text)
decompressed = lz77.decompress(compressed)

print(f"Original: {text}")
print(f"Compressed: {compressed}")
print(f"Decompressed: {decompressed}")
```

## Applications in AI and Computing

### Information-Theoretic Feature Selection

```python
class InfoTheoreticFeatureSelection:
    def __init__(self):
        pass
    
    def mutual_information_score(self, feature, target):
        """Calculate mutual information between feature and target"""
        # Create joint frequency table
        joint_counts = defaultdict(lambda: defaultdict(int))
        feature_counts = defaultdict(int)
        target_counts = defaultdict(int)
        
        for f_val, t_val in zip(feature, target):
            joint_counts[f_val][t_val] += 1
            feature_counts[f_val] += 1
            target_counts[t_val] += 1
        
        n = len(feature)
        mi = 0
        
        for f_val in joint_counts:
            for t_val in joint_counts[f_val]:
                joint_prob = joint_counts[f_val][t_val] / n
                feature_prob = feature_counts[f_val] / n
                target_prob = target_counts[t_val] / n
                
                if joint_prob > 0:
                    mi += joint_prob * math.log2(joint_prob / (feature_prob * target_prob))
        
        return mi
    
    def select_features(self, features, target, k=5):
        """Select top k features by mutual information"""
        mi_scores = []
        
        for i, feature in enumerate(features.T):
            score = self.mutual_information_score(feature, target)
            mi_scores.append((i, score))
        
        # Sort by mutual information score
        mi_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [idx for idx, score in mi_scores[:k]]
```

### Entropy in Machine Learning

```python
class DecisionTreeEntropy:
    """Information gain for decision tree splitting"""
    
    def calculate_entropy(self, labels):
        """Calculate Shannon entropy of label distribution"""
        if not labels:
            return 0
        
        label_counts = Counter(labels)
        total = len(labels)
        entropy = 0
        
        for count in label_counts.values():
            prob = count / total
            entropy -= prob * math.log2(prob)
        
        return entropy
    
    def information_gain(self, parent_labels, left_labels, right_labels):
        """Calculate information gain from split"""
        parent_entropy = self.calculate_entropy(parent_labels)
        n = len(parent_labels)
        
        left_weight = len(left_labels) / n
        right_weight = len(right_labels) / n
        
        weighted_entropy = (left_weight * self.calculate_entropy(left_labels) +
                          right_weight * self.calculate_entropy(right_labels))
        
        return parent_entropy - weighted_entropy
    
    def best_split(self, features, labels, feature_idx):
        """Find best split point for a feature"""
        unique_values = sorted(set(features[:, feature_idx]))
        best_gain = -1
        best_threshold = None
        
        for i in range(len(unique_values) - 1):
            threshold = (unique_values[i] + unique_values[i + 1]) / 2
            
            left_mask = features[:, feature_idx] <= threshold
            right_mask = ~left_mask
            
            left_labels = labels[left_mask]
            right_labels = labels[right_mask]
            
            gain = self.information_gain(labels, left_labels, right_labels)
            
            if gain > best_gain:
                best_gain = gain
                best_threshold = threshold
        
        return best_threshold, best_gain
```

### Channel Capacity in Neural Networks

```python
class NeuralInfoBottleneck:
    """Information Bottleneck principle in neural networks"""
    
    def __init__(self, beta=1.0):
        self.beta = beta  # Tradeoff parameter
    
    def mutual_info_estimator(self, x, y):
        """Estimate mutual information using binning"""
        # Simplified MI estimation
        joint_hist, x_edges, y_edges = np.histogram2d(
            x.flatten(), y.flatten(), bins=20
        )
        joint_hist = joint_hist + 1e-10  # Avoid log(0)
        
        # Normalize to probabilities
        joint_prob = joint_hist / joint_hist.sum()
        x_prob = joint_prob.sum(axis=1)
        y_prob = joint_prob.sum(axis=0)
        
        mi = 0
        for i in range(len(x_prob)):
            for j in range(len(y_prob)):
                if joint_prob[i, j] > 0:
                    mi += joint_prob[i, j] * math.log2(
                        joint_prob[i, j] / (x_prob[i] * y_prob[j])
                    )
        
        return mi
    
    def information_bottleneck_loss(self, x, t, y):
        """Calculate information bottleneck loss"""
        # I(X; T) - β * I(T; Y)
        compression_term = self.mutual_info_estimator(x, t)
        prediction_term = self.mutual_info_estimator(t, y)
        
        return compression_term - self.beta * prediction_term
```

## Quantum Information Theory

### Quantum Entropy

Extension to quantum systems:

```python
import numpy as np

class QuantumInformation:
    """Quantum information theory concepts"""
    
    def von_neumann_entropy(self, density_matrix):
        """Calculate von Neumann entropy S = -Tr(ρ log ρ)"""
        eigenvalues = np.linalg.eigvals(density_matrix)
        eigenvalues = eigenvalues[eigenvalues > 1e-12]  # Remove zero eigenvalues
        
        entropy = -np.sum(eigenvalues * np.log2(eigenvalues))
        return entropy
    
    def quantum_mutual_information(self, rho_AB, rho_A, rho_B):
        """Calculate quantum mutual information"""
        S_A = self.von_neumann_entropy(rho_A)
        S_B = self.von_neumann_entropy(rho_B)
        S_AB = self.von_neumann_entropy(rho_AB)
        
        return S_A + S_B - S_AB
    
    def entanglement_entropy(self, state_vector, subsystem_dims):
        """Calculate entanglement entropy of a bipartite system"""
        # Reshape state vector into matrix
        total_dim = len(state_vector)
        dim_A, dim_B = subsystem_dims
        
        if dim_A * dim_B != total_dim:
            raise ValueError("Subsystem dimensions don't match total dimension")
        
        # Reshape state vector into matrix and compute reduced density matrix
        state_matrix = state_vector.reshape(dim_A, dim_B)
        rho_A = np.dot(state_matrix, state_matrix.conj().T)
        
        return self.von_neumann_entropy(rho_A)

# Example: Bell state entanglement
bell_state = np.array([1, 0, 0, 1]) / np.sqrt(2)  # |00⟩ + |11⟩
quantum_info = QuantumInformation()

entanglement = quantum_info.entanglement_entropy(bell_state, (2, 2))
print(f"Entanglement entropy of Bell state: {entanglement:.3f} bits")
```

## Information Theory Bounds

### Rate-Distortion Theory

```python
class RateDistortionTheory:
    """Rate-distortion theory for lossy compression"""
    
    def __init__(self):
        pass
    
    def distortion_measure(self, original, compressed, metric='mse'):
        """Calculate distortion between original and compressed"""
        if metric == 'mse':
            return np.mean((original - compressed) ** 2)
        elif metric == 'hamming':
            return np.mean(original != compressed)
        else:
            raise ValueError("Unknown distortion metric")
    
    def rate_distortion_function(self, source_probs, distortion_matrix, D):
        """Compute rate-distortion function R(D)"""
        # Simplified calculation for demonstration
        # In practice, this requires solving an optimization problem
        
        # For Gaussian source with MSE distortion
        if hasattr(self, 'source_variance'):
            if D >= self.source_variance:
                return 0
            else:
                return 0.5 * math.log2(self.source_variance / D)
        
        return None
    
    def optimal_quantizer(self, data, num_levels, distortion_metric='mse'):
        """Design optimal quantizer using Lloyd-Max algorithm"""
        # Initialize quantization levels
        data_min, data_max = np.min(data), np.max(data)
        levels = np.linspace(data_min, data_max, num_levels)
        
        for iteration in range(50):  # Max iterations
            # Update decision boundaries
            boundaries = [(levels[i] + levels[i+1]) / 2 
                         for i in range(len(levels) - 1)]
            boundaries = [-np.inf] + boundaries + [np.inf]
            
            # Update quantization levels
            new_levels = []
            for i in range(num_levels):
                mask = (data >= boundaries[i]) & (data < boundaries[i+1])
                if np.any(mask):
                    new_levels.append(np.mean(data[mask]))
                else:
                    new_levels.append(levels[i])
            
            # Check convergence
            if np.allclose(levels, new_levels, rtol=1e-6):
                break
            
            levels = new_levels
        
        return levels, boundaries[1:-1]

# Example usage
np.random.seed(42)
gaussian_data = np.random.normal(0, 1, 1000)

rd_theory = RateDistortionTheory()
rd_theory.source_variance = 1.0

levels, boundaries = rd_theory.optimal_quantizer(gaussian_data, 8)
quantized = np.digitize(gaussian_data, boundaries)
reconstructed = np.array([levels[min(q-1, len(levels)-1)] for q in quantized])

distortion = rd_theory.distortion_measure(gaussian_data, reconstructed)
print(f"Quantization distortion: {distortion:.4f}")
print(f"Rate for D={distortion:.4f}: {rd_theory.rate_distortion_function(None, None, distortion):.3f} bits")
```

## Practical Applications

### Network Protocol Analysis

```python
class NetworkProtocolAnalyzer:
    """Analyze network protocols using information theory"""
    
    def __init__(self):
        self.packet_stats = defaultdict(int)
        self.flow_stats = defaultdict(lambda: defaultdict(int))
    
    def analyze_packet_entropy(self, packet_sizes):
        """Calculate entropy of packet size distribution"""
        size_counts = Counter(packet_sizes)
        total_packets = len(packet_sizes)
        
        entropy = 0
        for count in size_counts.values():
            prob = count / total_packets
            entropy -= prob * math.log2(prob)
        
        return entropy
    
    def detect_anomalies(self, packet_data, threshold=2.0):
        """Detect network anomalies using entropy"""
        window_size = 100
        anomalies = []
        
        for i in range(len(packet_data) - window_size):
            window = packet_data[i:i + window_size]
            entropy = self.analyze_packet_entropy([p['size'] for p in window])
            
            if entropy > threshold:
                anomalies.append({
                    'timestamp': window[0]['timestamp'],
                    'entropy': entropy,
                    'window_start': i
                })
        
        return anomalies
    
    def compression_potential(self, data):
        """Estimate compression potential using entropy"""
        entropy = self.analyze_packet_entropy(data)
        max_entropy = math.log2(len(set(data)))
        
        return {
            'entropy': entropy,
            'max_entropy': max_entropy,
            'compression_ratio': max_entropy / entropy if entropy > 0 else float('inf')
        }
```

### Bioinformatics Applications

```python
class DNAAnalyzer:
    """DNA sequence analysis using information theory"""
    
    def __init__(self):
        self.bases = ['A', 'T', 'G', 'C']
    
    def sequence_entropy(self, sequence):
        """Calculate entropy of DNA sequence"""
        base_counts = Counter(sequence)
        total = len(sequence)
        
        entropy = 0
        for base in self.bases:
            if base_counts[base] > 0:
                prob = base_counts[base] / total
                entropy -= prob * math.log2(prob)
        
        return entropy
    
    def mutual_information_sites(self, sequences):
        """Calculate mutual information between sequence positions"""
        if not sequences or len(set(len(seq) for seq in sequences)) > 1:
            raise ValueError("All sequences must have the same length")
        
        seq_length = len(sequences[0])
        mi_matrix = np.zeros((seq_length, seq_length))
        
        for i in range(seq_length):
            for j in range(i, seq_length):
                site_i = [seq[i] for seq in sequences]
                site_j = [seq[j] for seq in sequences]
                
                mi = self.mutual_information_discrete(site_i, site_j)
                mi_matrix[i, j] = mi
                mi_matrix[j, i] = mi
        
        return mi_matrix
    
    def mutual_information_discrete(self, x, y):
        """Calculate mutual information for discrete variables"""
        joint_counts = defaultdict(lambda: defaultdict(int))
        x_counts = defaultdict(int)
        y_counts = defaultdict(int)
        
        for x_val, y_val in zip(x, y):
            joint_counts[x_val][y_val] += 1
            x_counts[x_val] += 1
            y_counts[y_val] += 1
        
        n = len(x)
        mi = 0
        
        for x_val in joint_counts:
            for y_val in joint_counts[x_val]:
                joint_prob = joint_counts[x_val][y_val] / n
                x_prob = x_counts[x_val] / n
                y_prob = y_counts[y_val] / n
                
                if joint_prob > 0:
                    mi += joint_prob * math.log2(joint_prob / (x_prob * y_prob))
        
        return mi
    
    def find_conserved_regions(self, sequences, threshold=1.5):
        """Find conserved regions with high mutual information"""
        mi_matrix = self.mutual_information_sites(sequences)
        conserved_regions = []
        
        for i in range(len(mi_matrix)):
            avg_mi = np.mean(mi_matrix[i])
            if avg_mi > threshold:
                conserved_regions.append({
                    'position': i,
                    'average_mi': avg_mi,
                    'max_mi': np.max(mi_matrix[i])
                })
        
        return conserved_regions

# Example usage
dna_sequences = [
    "ATCGATCGATCG",
    "ATCGATCGATCG", 
    "ATCGATCGATCG",
    "ATCGATGGATCG",  # Mutation at position 6
    "ATCGATCGATCG"
]

analyzer = DNAAnalyzer()
entropy = analyzer.sequence_entropy(dna_sequences[0])
conserved = analyzer.find_conserved_regions(dna_sequences)

print(f"Sequence entropy: {entropy:.3f} bits")
print(f"Conserved regions: {len(conserved)}")
```

## Performance Metrics

### Information-Theoretic Metrics

```python
class InfoMetrics:
    """Information-theoretic performance metrics"""
    
    def perplexity(self, probabilities):
        """Calculate perplexity from probability distribution"""
        entropy = shannon_entropy(probabilities)
        return 2 ** entropy
    
    def cross_entropy(self, true_probs, pred_probs):
        """Calculate cross-entropy between distributions"""
        ce = 0
        for p_true, p_pred in zip(true_probs, pred_probs):
            if p_true > 0 and p_pred > 0:
                ce -= p_true * math.log2(p_pred)
        return ce
    
    def kl_divergence(self, p, q):
        """Calculate Kullback-Leibler divergence D(P||Q)"""
        kl = 0
        for p_i, q_i in zip(p, q):
            if p_i > 0 and q_i > 0:
                kl += p_i * math.log2(p_i / q_i)
        return kl
    
    def js_divergence(self, p, q):
        """Calculate Jensen-Shannon divergence"""
        m = [(p_i + q_i) / 2 for p_i, q_i in zip(p, q)]
        return (self.kl_divergence(p, m) + self.kl_divergence(q, m)) / 2
    
    def information_radius(self, distributions):
        """Calculate information radius of multiple distributions"""
        # Average distribution
        avg_dist = [sum(dist[i] for dist in distributions) / len(distributions) 
                   for i in range(len(distributions[0]))]
        
        # Average KL divergence to center
        avg_kl = sum(self.kl_divergence(dist, avg_dist) 
                    for dist in distributions) / len(distributions)
        
        return avg_kl

# Example: Model evaluation
metrics = InfoMetrics()

# True distribution vs predicted
true_dist = [0.6, 0.3, 0.1]
pred_dist = [0.5, 0.4, 0.1]

print(f"Cross-entropy: {metrics.cross_entropy(true_dist, pred_dist):.3f}")
print(f"KL divergence: {metrics.kl_divergence(true_dist, pred_dist):.3f}")
print(f"JS divergence: {metrics.js_divergence(true_dist, pred_dist):.3f}")
```

## Related Concepts

- [[Law of Semantic Feedback]] - Semantic information and feedback
- [[Entropy (Physics)]] - Thermodynamic entropy connections
- [[Compression Algorithms]] - Practical data compression
- [[Error Correction Codes]] - Coding theory applications
- [[Cryptography]] - Information security foundations
- [[Machine Learning Theory]] - Information-theoretic learning
- [[Network Theory]] - Communication system analysis
- [[Quantum Computing]] - Quantum information processing
- [[Signal Processing]] - Information in signals
- [[Data Mining]] - Information extraction techniques
- [[Computational Complexity]] - Information and computation
- [[Algorithmic Information Theory]] - Kolmogorov complexity

## Zero-Entropy Statement

"Information is the currency of certainty—the more surprising the message, the richer its content in the economy of knowledge."

---
*The mathematical foundation of all communication, computation, and information processing systems*